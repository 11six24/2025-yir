# Deployment Guide - Ambassador Year in Review

## Prerequisites
- Cloudflare account with Pages and D1 access
- GitHub repository connected to Cloudflare Pages
- Shopify Admin API credentials

## Step 1: Set Up D1 Database

### Create the database
```bash
npx wrangler d1 create ambassador-yir-db
```

Update `wrangler.toml` with the database ID returned from the command above.

### Initialize schema
```bash
npx wrangler d1 execute ambassador-yir-db --file=d1-schema.sql
```

### Import ambassador data
```bash
npx wrangler d1 execute ambassador-yir-db --file=d1-import.sql
```

### Import referrals data
```bash
npx wrangler d1 execute ambassador-yir-db --file=d1-referrals-import.sql
```

This will import all 28,705 referrals (~6.66 MB) into the database.

## Step 2: Configure Cloudflare Pages

### Connect to GitHub
1. Push this repository to GitHub
2. Go to Cloudflare Dashboard > Pages
3. Create new project and connect to your GitHub repo
4. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `cd ambassador-yir && npm install && npm run build`
   - **Build output directory**: `ambassador-yir/dist`

### Set Environment Variables
Add these in Pages Settings > Environment variables:

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_admin_api_token
```

### Bind D1 Database
In Pages Settings > Functions > D1 database bindings:
- **Variable name**: `DB`
- **D1 database**: Select `ambassador-yir-db`

## Step 3: Deploy

Push to your main branch - Cloudflare Pages will automatically build and deploy.

## How It Works

### On-Demand Fetching
When an ambassador visits their unique link for the first time:

1. **API Endpoint** (`/api/ambassador/[uuid]`):
   - Returns ambassador data from D1
   - Checks if `top_models` exist
   - Returns status: `none`, `loading`, or `ready`
   - If not processed, triggers background job

2. **Background Job** (`/api/process-ambassador`):
   - Queries `referrals` table for ambassador's order IDs
   - Fetches up to 50 orders from Shopify GraphQL API
   - Calculates top 3 most-ordered products
   - Saves to `top_models` table
   - Rate limited to 7 req/sec (Shopify API limit)

3. **Frontend Polling**:
   - Shows loading spinner while fetching
   - Polls API every 3 seconds for up to 30 seconds
   - Updates when data ready or skips if none

### Caching Strategy
- Each ambassador's top models are fetched **once** and cached in D1
- Subsequent visits load instantly from cache
- No redundant Shopify API calls

## Testing Locally

### Start local development
```bash
cd ambassador-yir
npm run dev
```

This uses the static `ambassador-data.json` file in dev mode.

### Test with D1 locally
```bash
npx wrangler pages dev ambassador-yir/dist --binding DB=ambassador-yir-db
```

## Post-Deployment

### Generate Ambassador Links
Use the `ambassador-links.csv` file (auto-generated) to send personalized emails:

```csv
name,email,link
John Doe,john@example.com,https://your-site.pages.dev/yir/abc-123-uuid
```

### Monitor Processing
Query processing status:
```bash
npx wrangler d1 execute ambassador-yir-db --command="SELECT status, COUNT(*) FROM processing_status GROUP BY status"
```

## Troubleshooting

### Background jobs not completing
- Check Cloudflare Pages Functions logs in dashboard
- Verify Shopify API credentials are correct
- Ensure D1 binding is configured as `DB`

### Too many Shopify API calls
- Default rate limit: 7 req/sec with 200ms delay
- Processes up to 50 orders per ambassador
- Estimated time: ~7 seconds per ambassador on first load

### Data not showing
- Verify ambassador exists: `SELECT * FROM ambassadors WHERE uuid = 'xxx'`
- Check referrals imported: `SELECT COUNT(*) FROM referrals`
- Check processing status: `SELECT * FROM processing_status WHERE ambassador_uuid = 'xxx'`
