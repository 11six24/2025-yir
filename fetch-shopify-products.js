require('dotenv').config();
const XLSX = require('xlsx');
const fs = require('fs');

// Configuration
const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN;
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const RATE_LIMIT = parseInt(process.env.SHOPIFY_RATE_LIMIT || '2'); // requests per second
const BATCH_SIZE = 100; // Save progress every N orders

if (!SHOPIFY_STORE || !ACCESS_TOKEN) {
  console.error('❌ Missing Shopify credentials!');
  console.error('Please create a .env file with SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN');
  process.exit(1);
}

// Simple rate limiter - sleeps between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const DELAY_MS = 1000 / RATE_LIMIT;

// GraphQL query to get order line items with product images
const ORDER_QUERY = `
  query getOrder($id: ID!) {
    order(id: $id) {
      id
      name
      lineItems(first: 10) {
        edges {
          node {
            title
            quantity
            variant {
              id
              title
              image {
                url
                altText
              }
              product {
                id
                title
                productType
                vendor
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Fetch order from Shopify
async function fetchOrder(orderId) {
  const gid = `gid://shopify/Order/${orderId.trim()}`;

  try {
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: ORDER_QUERY,
        variables: { id: gid },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error(`GraphQL errors for order ${orderId}:`, data.errors);
      return null;
    }

    return data.data?.order || null;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error.message);
    return null;
  }
}

// Extract product info from order
function extractProducts(order) {
  if (!order || !order.lineItems) return [];

  const products = [];

  order.lineItems.edges.forEach(edge => {
    const item = edge.node;
    const product = item.variant?.product;

    if (product) {
      // Prefer variant image, fallback to product featured image
      const imageUrl = item.variant?.image?.url || product.featuredImage?.url || null;

      products.push({
        title: product.title,
        variantTitle: item.variant.title !== 'Default Title' ? item.variant.title : '',
        productType: product.productType,
        vendor: product.vendor,
        quantity: item.quantity,
        imageUrl: imageUrl,
      });
    }
  });

  return products;
}

// Main processing function
async function processReferrals() {
  console.log('🚀 Starting Shopify product fetch...\n');

  // Read referral data
  console.log('📊 Reading referral data...');
  const workbook = XLSX.readFile('uppromote_referral_102736 (1).xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const referrals = XLSX.utils.sheet_to_json(sheet);

  console.log(`Found ${referrals.length} referrals`);

  // Get unique order IDs
  const orderMap = new Map();
  referrals.forEach(ref => {
    const orderId = ref.order_id?.toString().trim();
    const email = ref.affiliate_email?.toLowerCase().trim();

    if (orderId && email) {
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          orderId,
          emails: new Set([email]),
          orderName: ref.order_name,
        });
      } else {
        orderMap.get(orderId).emails.add(email);
      }
    }
  });

  console.log(`Unique orders to fetch: ${orderMap.size}`);

  // Load existing progress if any
  let orderProducts = {};
  let processedCount = 0;

  if (fs.existsSync('order-products.json')) {
    orderProducts = JSON.parse(fs.readFileSync('order-products.json', 'utf8'));
    processedCount = Object.keys(orderProducts).length;
    console.log(`Resuming from ${processedCount} already processed orders`);
  }

  // Process orders with rate limiting
  const orders = Array.from(orderMap.values());
  const toProcess = orders.filter(o => !orderProducts[o.orderId]);

  console.log(`\n⏳ Fetching ${toProcess.length} remaining orders (${RATE_LIMIT} req/sec)...\n`);

  let completed = 0;
  let failed = 0;
  const startTime = Date.now();

  // Process orders sequentially with rate limiting
  for (let i = 0; i < toProcess.length; i++) {
    const orderInfo = toProcess[i];

    // Fetch order
    const order = await fetchOrder(orderInfo.orderId);

    if (order) {
      const products = extractProducts(order);
      completed++;

      orderProducts[orderInfo.orderId] = {
        orderId: orderInfo.orderId,
        products,
        emails: Array.from(orderInfo.emails),
      };

      // Progress indicator
      if (completed % 10 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = completed / elapsed;
        const remaining = toProcess.length - completed - failed;
        const eta = remaining / rate;

        console.log(`Progress: ${completed}/${toProcess.length} (${failed} failed) - ETA: ${Math.round(eta / 60)}min - Rate: ${rate.toFixed(2)} req/s`);
      }
    } else {
      failed++;
    }

    // Save progress every batch
    if ((completed + failed) % BATCH_SIZE === 0) {
      fs.writeFileSync('order-products.json', JSON.stringify(orderProducts, null, 2));
      console.log(`💾 Saved progress: ${Object.keys(orderProducts).length} orders`);
    }

    // Rate limiting - wait before next request
    await delay(DELAY_MS);
  }

  // Final save
  fs.writeFileSync('order-products.json', JSON.stringify(orderProducts, null, 2));

  const totalTime = (Date.now() - startTime) / 1000;

  console.log(`\n✅ Complete!`);
  console.log(`Total time: ${Math.round(totalTime / 60)} minutes`);
  console.log(`Successful: ${completed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total orders in cache: ${Object.keys(orderProducts).length}`);

  return orderProducts;
}

// Run the script
processReferrals().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
