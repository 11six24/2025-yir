require('dotenv').config();
const fs = require('fs');

console.log('🖼️  Fetching product images from Shopify...\n');

// Configuration
const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN;
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const RATE_LIMIT = parseInt(process.env.SHOPIFY_RATE_LIMIT || '5');

if (!SHOPIFY_STORE || !ACCESS_TOKEN) {
  console.error('❌ Missing Shopify credentials in .env');
  process.exit(1);
}

// Check if order-products.json exists
if (!fs.existsSync('order-products.json')) {
  console.error('❌ order-products.json not found!');
  console.error('Run fetch-shopify-products.js first to fetch order data.');
  process.exit(1);
}

// Rate limiter
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const DELAY_MS = 1000 / RATE_LIMIT;

// GraphQL query to get product by title
const PRODUCT_SEARCH_QUERY = `
  query searchProducts($query: String!) {
    products(first: 1, query: $query) {
      edges {
        node {
          id
          title
          featuredImage {
            url
            altText
          }
          variants(first: 10) {
            edges {
              node {
                title
                image {
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

// Fetch product images from Shopify
async function fetchProductImage(productTitle) {
  try {
    const query = `title:"${productTitle.replace(/"/g, '\\"')}"`;

    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: PRODUCT_SEARCH_QUERY,
        variables: { query },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error(`GraphQL errors for "${productTitle}":`, data.errors);
      return null;
    }

    const product = data.data?.products?.edges?.[0]?.node;

    if (product && product.featuredImage) {
      return product.featuredImage.url;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching image for "${productTitle}":`, error.message);
    return null;
  }
}

async function cacheProductImages() {
  console.log('📦 Loading order products...');
  const orderProducts = JSON.parse(fs.readFileSync('order-products.json', 'utf8'));

  // Extract all unique product titles
  const uniqueProducts = new Set();

  Object.values(orderProducts).forEach(order => {
    order.products.forEach(product => {
      const fullName = product.variantTitle
        ? `${product.title} - ${product.variantTitle}`
        : product.title;
      uniqueProducts.add(fullName);
    });
  });

  console.log(`Found ${uniqueProducts.size} unique products\n`);

  // Load existing cache if available
  let imageCache = {};
  if (fs.existsSync('product-image-cache.json')) {
    imageCache = JSON.parse(fs.readFileSync('product-image-cache.json', 'utf8'));
    console.log(`Loaded ${Object.keys(imageCache).length} cached images`);
  }

  // Find products that need images
  const productsToFetch = Array.from(uniqueProducts).filter(p => !imageCache[p]);

  console.log(`Need to fetch ${productsToFetch.length} new product images`);
  console.log(`Skipping ${uniqueProducts.size - productsToFetch.length} already cached\n`);

  if (productsToFetch.length === 0) {
    console.log('✅ All product images already cached!');
    return imageCache;
  }

  console.log(`⏳ Fetching images at ${RATE_LIMIT} req/sec...\n`);

  let fetched = 0;
  let failed = 0;
  const startTime = Date.now();

  // Fetch images for products not in cache
  for (const productName of productsToFetch) {
    // Try to extract base product title (remove variant info)
    const baseTitle = productName.split(' - ')[0];

    const imageUrl = await fetchProductImage(baseTitle);

    if (imageUrl) {
      imageCache[productName] = imageUrl;
      fetched++;
    } else {
      imageCache[productName] = null; // Cache the miss to avoid retrying
      failed++;
    }

    // Progress indicator
    if ((fetched + failed) % 10 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = (fetched + failed) / elapsed;
      const remaining = productsToFetch.length - fetched - failed;
      const eta = remaining / rate;

      console.log(`Progress: ${fetched + failed}/${productsToFetch.length} (${fetched} success, ${failed} failed) - ETA: ${Math.round(eta / 60)}min`);
    }

    // Save cache every 50 products
    if ((fetched + failed) % 50 === 0) {
      fs.writeFileSync('product-image-cache.json', JSON.stringify(imageCache, null, 2));
      console.log(`💾 Saved cache: ${Object.keys(imageCache).length} total images`);
    }

    // Rate limiting
    await delay(DELAY_MS);
  }

  // Final save
  fs.writeFileSync('product-image-cache.json', JSON.stringify(imageCache, null, 2));

  const totalTime = (Date.now() - startTime) / 1000;

  console.log(`\n✅ Complete!`);
  console.log(`Total time: ${Math.round(totalTime / 60)} minutes`);
  console.log(`Images fetched: ${fetched}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total in cache: ${Object.keys(imageCache).length}`);

  return imageCache;
}

// Run the script
cacheProductImages()
  .then(() => {
    console.log('\n📝 Next step: Run add-top-models.js to add images to ambassador data');
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
