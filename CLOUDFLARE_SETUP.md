# Cloudflare Pages Setup - Final Steps

## D1 Database - COMPLETED

Your D1 database is now fully set up and populated with production data.

**Database Details:**
- **Name:** `ambassador-yir-db`
- **ID:** `1bf401ce-682c-487e-b60c-8a5820b7f42e`
- **Region:** ENAM (East North America)
- **Data:**
  - 2,409 ambassadors with full stats and archetypes
  - 28,705 referrals for on-demand product fetching
  - All tables and indexes created

**Security:** No JSON files will be deployed - all data is secured in D1 database.

---

## Cloudflare Pages Configuration

### 1. D1 Database Binding

In your Cloudflare Pages dashboard:

1. Go to **Settings** > **Functions**
2. Scroll to **D1 database bindings**
3. Click **Add binding**
   - **Variable name:** `DB`
   - **D1 database:** Select `ambassador-yir-db`
4. Click **Save**

This connects your Pages Functions to the D1 database.

---

### 2. Environment Variables (Shopify API)

Go to **Settings** > **Environment variables** and add:

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_admin_api_access_token
```

**Important:** Add these for both **Production** and **Preview** environments.

#### How to get Shopify credentials:

1. Go to your Shopify admin
2. **Settings** > **Apps and sales channels** > **Develop apps**
3. Create a new app or use existing
4. Grant permissions:
   - `read_orders`
   - `read_products`
5. Install the app and copy the **Admin API access token**

---

### 3. Build Settings

Your build settings should be:

- **Framework preset:** Vite
- **Build command:** `cd ambassador-yir && npm install && npm run build`
- **Build output directory:** `ambassador-yir/dist`
- **Root directory:** `/` (leave default)

---

## How the On-Demand System Works

### When an ambassador opens their link:

1. **First Visit:**
   - API checks D1 for top models
   - If none found, triggers background job
   - Frontend shows loading spinner
   - Background job:
     - Queries D1 for their referral order IDs
     - Fetches those orders from Shopify (up to 50)
     - Calculates top 3 products
     - Saves to D1 `top_models` table
   - Frontend polls every 3 seconds
   - Shows results when ready

2. **Subsequent Visits:**
   - Data loads instantly from D1 cache
   - No Shopify API calls needed

### Rate Limiting:
- 7 requests/second to Shopify
- ~7 seconds per ambassador on first load
- Only processes when they actually visit

---

## Deployment Checklist

- [x] D1 database created and populated
- [x] JSON files removed from public folder
- [ ] D1 binding configured in Pages (Variable: `DB`)
- [ ] Shopify environment variables added
- [ ] Build settings verified
- [ ] Test deployment triggered

---

## Testing

After deployment, test with an ambassador UUID:

```
https://your-site.pages.dev/yir/54537609-4b5d-44b9-8aeb-c755f0ed07c8
```

**What to check:**
1. Ambassador data loads from D1
2. Loading spinner appears for top models
3. Top models load after ~10 seconds
4. No errors in browser console
5. Share screen works with download

---

## Monitoring

### Check D1 database:

```bash
# View all ambassadors
npx wrangler d1 execute ambassador-yir-db --remote --command="SELECT uuid, name, email FROM ambassadors LIMIT 5"

# Check processing status
npx wrangler d1 execute ambassador-yir-db --remote --command="SELECT status, COUNT(*) FROM processing_status GROUP BY status"

# View top models
npx wrangler d1 execute ambassador-yir-db --remote --command="SELECT * FROM top_models LIMIT 5"
```

### View logs:
- Cloudflare Dashboard > Pages > [Your Project] > Functions
- Real-time logs for API calls and background jobs

---

## Database Size & Limits

**Current size:** 6.13 MB

**D1 Free tier limits:**
- 5 GB storage (you're using 0.12%)
- 5 million rows read/day
- 100,000 rows written/day

**Estimated usage:**
- ~10,000 reads/day if all ambassadors visit
- ~50,000 writes/day for background jobs
- Well within free tier limits

---

## Troubleshooting

### "Ambassador not found" error
- Check UUID is correct
- Verify ambassador exists in D1

### Top models not loading
- Check Shopify credentials are correct
- View Functions logs for API errors
- Verify `DB` binding is configured

### Background job timing out
- Reduce order limit in `functions/api/process-ambassador.js` (line 186)
- Currently set to 50 orders max

### Rate limit errors
- Adjust delay in `functions/api/process-ambassador.js` (line 196)
- Currently 200ms between requests (5 req/sec)
