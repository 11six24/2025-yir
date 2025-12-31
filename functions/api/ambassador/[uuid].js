// Main API endpoint - serves ambassador data and triggers background processing
// Path: /api/ambassador/:uuid

export async function onRequest(context) {
  const { request, env, params } = context;
  const { uuid } = params;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid || !uuidRegex.test(uuid)) {
    return new Response(
      JSON.stringify({ error: 'Invalid UUID' }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const db = env.DB;

    // Get ambassador data
    const ambassador = await db
      .prepare('SELECT * FROM ambassadors WHERE uuid = ?')
      .bind(uuid)
      .first();

    if (!ambassador) {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Check for existing top models
    const topModelsResult = await db
      .prepare(
        'SELECT product_name as name, product_image_url as image, count FROM top_models WHERE ambassador_uuid = ? ORDER BY rank ASC'
      )
      .bind(uuid)
      .all();

    // Check processing status
    const processingStatus = await db
      .prepare('SELECT status FROM processing_status WHERE ambassador_uuid = ?')
      .bind(uuid)
      .first();

    // Build response
    const response = {
      name: ambassador.name,
      email: ambassador.email,
      program: ambassador.program,
      stats: {
        revenue: ambassador.revenue,
        orders: ambassador.orders,
        clicks: ambassador.clicks,
        commission: ambassador.commission,
      },
      ranking: {
        overall: ambassador.ranking_overall,
        revenue: ambassador.ranking_revenue,
        orders: ambassador.ranking_orders,
        clicks: ambassador.ranking_clicks,
      },
      archetype: {
        title: ambassador.archetype_title,
        description: ambassador.archetype_description,
      },
      milestones: {
        firstOrder: ambassador.first_order,
        bestMonth: ambassador.best_month,
        totalLogins: ambassador.total_logins,
        lastActive: ambassador.last_active,
      },
    };

    // Determine top models status
    if (topModelsResult.results && topModelsResult.results.length > 0) {
      response.topModels = topModelsResult.results;
      response.topModelsStatus = 'ready';
    } else if (processingStatus?.status === 'processing') {
      response.topModelsStatus = 'loading';
    } else if (processingStatus?.status === 'completed') {
      // Completed but no top models (no referrals)
      response.topModelsStatus = 'none';
    } else {
      // Not processed yet - trigger background job
      response.topModelsStatus = 'loading';

      // Trigger processing (fire and forget)
      context.waitUntil(
        fetch(new URL('/api/process-ambassador', request.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid }),
        })
      );
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
