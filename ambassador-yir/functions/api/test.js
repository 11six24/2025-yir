// Simple test endpoint to verify Functions are working
export async function onRequest(context) {
  const { env } = context;

  const diagnostics = {
    functionsWorking: true,
    timestamp: new Date().toISOString(),
    hasDB: !!env.DB,
    hasShopifyDomain: !!env.SHOPIFY_STORE_DOMAIN,
    hasShopifyToken: !!env.SHOPIFY_ACCESS_TOKEN,
  };

  // Try to query D1
  if (env.DB) {
    try {
      const result = await env.DB
        .prepare('SELECT COUNT(*) as total FROM ambassadors')
        .first();
      diagnostics.dbConnected = true;
      diagnostics.ambassadorCount = result.total;
    } catch (error) {
      diagnostics.dbConnected = false;
      diagnostics.dbError = error.message;
    }
  }

  return new Response(JSON.stringify(diagnostics, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
