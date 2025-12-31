// Background job to fetch and process top models for an ambassador
// Called by main API when ambassador loads page and has no top models

const ORDER_QUERY = `
  query getOrder($id: ID!) {
    order(id: $id) {
      id
      lineItems(first: 10) {
        edges {
          node {
            title
            quantity
            variant {
              title
              image { url }
              product {
                title
                featuredImage { url }
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchOrderFromShopify(orderId, env) {
  const gid = `gid://shopify/Order/${orderId.trim()}`;

  try {
    const response = await fetch(
      `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: ORDER_QUERY,
          variables: { id: gid },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.order || null;
  } catch (error) {
    console.error(`Shopify error for order ${orderId}:`, error);
    return null;
  }
}

function extractProducts(order) {
  if (!order?.lineItems) return [];

  const products = [];
  order.lineItems.edges.forEach((edge) => {
    const item = edge.node;
    const product = item.variant?.product;

    if (product) {
      const imageUrl = item.variant?.image?.url || product.featuredImage?.url || null;
      const fullName =
        item.variant.title !== 'Default Title'
          ? `${product.title} - ${item.variant.title}`
          : product.title;

      for (let i = 0; i < item.quantity; i++) {
        products.push({ fullName, imageUrl });
      }
    }
  });

  return products;
}

function calculateTopModels(products) {
  const productCounts = {};
  const productImages = {};

  products.forEach((p) => {
    productCounts[p.fullName] = (productCounts[p.fullName] || 0) + 1;
    if (p.imageUrl && !productImages[p.fullName]) {
      productImages[p.fullName] = p.imageUrl;
    }
  });

  return Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count], index) => ({
      rank: index + 1,
      name,
      count,
      image: productImages[name] || null,
    }));
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { uuid } = await request.json();

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (!uuid) {
    return new Response(JSON.stringify({ error: 'UUID required' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const db = env.DB;

    // Check if already processing
    const status = await db
      .prepare('SELECT status FROM processing_status WHERE ambassador_uuid = ?')
      .bind(uuid)
      .first();

    if (status?.status === 'processing' || status?.status === 'completed') {
      return new Response(
        JSON.stringify({ status: status.status }),
        { headers: corsHeaders }
      );
    }

    // Mark as processing
    await db
      .prepare(
        `INSERT OR REPLACE INTO processing_status (ambassador_uuid, status, started_at)
         VALUES (?, 'processing', datetime('now'))`
      )
      .bind(uuid)
      .run();

    // Get ambassador email
    const ambassador = await db
      .prepare('SELECT email FROM ambassadors WHERE uuid = ?')
      .bind(uuid)
      .first();

    if (!ambassador) {
      return new Response(JSON.stringify({ error: 'Ambassador not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Get all referrals for this ambassador
    const referrals = await db
      .prepare('SELECT DISTINCT order_id FROM referrals WHERE affiliate_email = ?')
      .bind(ambassador.email.toLowerCase())
      .all();

    if (!referrals.results || referrals.results.length === 0) {
      // No referrals, mark as completed with no top models
      await db
        .prepare(
          `UPDATE processing_status
           SET status = 'completed', completed_at = datetime('now')
           WHERE ambassador_uuid = ?`
        )
        .bind(uuid)
        .run();

      return new Response(
        JSON.stringify({ status: 'completed', topModels: [] }),
        { headers: corsHeaders }
      );
    }

    // Process in the background (async, don't wait)
    context.waitUntil(
      (async () => {
        try {
          const allProducts = [];

          // Fetch orders in parallel batches (faster!)
          const orderIds = referrals.results.slice(0, 50).map((r) => r.order_id);
          const BATCH_SIZE = 10; // Fetch 10 orders at a time

          for (let i = 0; i < orderIds.length; i += BATCH_SIZE) {
            const batch = orderIds.slice(i, i + BATCH_SIZE);

            // Fetch this batch in parallel
            const batchPromises = batch.map(orderId =>
              fetchOrderFromShopify(orderId, env)
            );

            const batchResults = await Promise.all(batchPromises);

            // Extract products from successful fetches
            batchResults.forEach(order => {
              if (order) {
                const products = extractProducts(order);
                allProducts.push(...products);
              }
            });

            // Small delay between batches (not between individual requests)
            if (i + BATCH_SIZE < orderIds.length) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }

          // Calculate top models
          const topModels = calculateTopModels(allProducts);

          // Save to D1
          for (const model of topModels) {
            await db
              .prepare(
                `INSERT INTO top_models (ambassador_uuid, rank, product_name, product_image_url, count)
                 VALUES (?, ?, ?, ?, ?)`
              )
              .bind(uuid, model.rank, model.name, model.image, model.count)
              .run();
          }

          // Mark as completed
          await db
            .prepare(
              `UPDATE processing_status
               SET status = 'completed', completed_at = datetime('now')
               WHERE ambassador_uuid = ?`
            )
            .bind(uuid)
            .run();
        } catch (error) {
          console.error('Background processing error:', error);

          // Mark as failed
          await db
            .prepare(
              `UPDATE processing_status
               SET status = 'failed', completed_at = datetime('now'), error_message = ?
               WHERE ambassador_uuid = ?`
            )
            .bind(error.message, uuid)
            .run();
        }
      })()
    );

    return new Response(
      JSON.stringify({ status: 'processing', message: 'Background job started' }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Process error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
