# Cloudflare Queues Setup for Background Job Processing

The Ambassador YIR now uses **Cloudflare Queues** for reliable background processing of top models data.

## Benefits of Queues

✅ **No timeout limits** - Jobs can take as long as needed
✅ **Automatic retries** - Failed jobs retry up to 3 times
✅ **Guaranteed delivery** - Jobs won't be lost
✅ **Dead letter queue** - Failed jobs stored for debugging
✅ **Batch processing** - Process up to 10 ambassadors at once

## Setup Instructions

### 1. Create the Queues

In your Cloudflare dashboard or via wrangler:

```bash
# Create the main queue
npx wrangler queues create top-models-queue

# Create the dead letter queue (for failed jobs)
npx wrangler queues create top-models-dlq
```

### 2. Configure in Cloudflare Pages

Go to your Cloudflare Pages project:

**Settings > Functions > Queue Bindings**

Add Queue Producer binding:
- **Variable name:** `TOP_MODELS_QUEUE`
- **Queue:** `top-models-queue`

The queue consumer is configured automatically via `wrangler.toml`.

### 3. Deploy the Queue Consumer Worker

The queue consumer must be deployed as a **separate Worker** (Pages Functions can't consume from queues):

```bash
cd worker
npx wrangler deploy
```

Set environment variables for the Worker:

```bash
npx wrangler secret put SHOPIFY_STORE_DOMAIN
# Enter: your-store.myshopify.com

npx wrangler secret put SHOPIFY_ACCESS_TOKEN
# Enter: shpat_xxxxx
```

### 4. Deploy Pages (API that sends to queue)

```bash
cd ..
git add .
git commit -m "Add Cloudflare Queues for background processing"
git push
```

## How It Works

### Flow

1. **User loads their page**
   - API checks if top models exist
   - If not, sends job to queue
   - Returns immediately with status: 'loading'

2. **Queue consumer processes job**
   - Runs independently in background
   - No timeout limits
   - Fetches orders from Shopify in parallel batches
   - Calculates top 3 models
   - Saves to D1 database

3. **Frontend polls for updates**
   - Checks every 3 seconds
   - Shows loading spinner
   - Updates when data ready

4. **On retry/failure**
   - Automatic retry up to 3 times
   - Exponential backoff
   - Failed jobs go to dead letter queue

### Queue Configuration

From `wrangler.toml`:

```toml
[[queues.consumers]]
queue = "top-models-queue"
max_batch_size = 10          # Process up to 10 jobs at once
max_batch_timeout = 30       # Wait max 30 seconds to fill batch
max_retries = 3              # Retry failed jobs 3 times
dead_letter_queue = "top-models-dlq"  # Store permanently failed jobs
```

## Monitoring

### View Queue Status

```bash
# Check queue stats
npx wrangler queues list

# View messages in queue
npx wrangler queues consumer http top-models-queue --port 8787
```

### Check Dead Letter Queue

If jobs are failing repeatedly, check the DLQ:

```bash
# View failed jobs
npx wrangler queues consumer http top-models-dlq --port 8788
```

### Database Monitoring

Check processing status in D1:

```bash
# View current jobs
npx wrangler d1 execute ambassador-yir-db --remote --command="
  SELECT status, COUNT(*) as count
  FROM processing_status
  GROUP BY status
"

# View failed jobs
npx wrangler d1 execute ambassador-yir-db --remote --command="
  SELECT ambassador_uuid, error_message, completed_at
  FROM processing_status
  WHERE status = 'failed'
  ORDER BY completed_at DESC
  LIMIT 10
"
```

## Troubleshooting

### Queue not processing

1. Check queue exists:
   ```bash
   npx wrangler queues list
   ```

2. Verify binding in Cloudflare Pages:
   - Settings > Functions > Queue Bindings
   - Should see `TOP_MODELS_QUEUE` → `top-models-queue`

3. Check queue consumer logs in Cloudflare dashboard

### Jobs failing

Check the dead letter queue:
```bash
npx wrangler queues consumer http top-models-dlq --port 8788
```

Common issues:
- Shopify API credentials missing/wrong
- Shopify rate limiting (should auto-retry)
- Network timeouts (should auto-retry)

### Retry a failed job manually

```bash
# Get the job from DLQ and re-send to main queue
# (Manual process - check Cloudflare docs)
```

## Cost

**Cloudflare Queues Pricing** (Workers Paid plan required):
- **$0.40 per million operations**
- Operations = sends + receives + deletes

**Expected cost for this app:**
- 1,836 ambassadors with referrals
- ~1,836 queue sends
- ~1,836 queue receives
- ~1,836 queue deletes
- **Total: 5,508 operations** ≈ $0.002 (less than 1 cent)

Plus standard Workers usage (already included in paid plan).

## Performance

With queue-based processing:

- **Average job time:** 2-3 seconds
- **No timeout limits**
- **Concurrent processing:** Up to 10 jobs at once
- **Automatic retries:** Failed jobs retry with backoff
- **User experience:** Seamless - polls in background while they navigate

## Files

- `functions/queue-consumer.js` - Queue consumer that processes jobs
- `functions/api/ambassador/[uuid].js` - API that sends jobs to queue
- `wrangler.toml` - Queue configuration
- `functions/api/process-ambassador.js` - **DEPRECATED** (old endpoint, can delete)
