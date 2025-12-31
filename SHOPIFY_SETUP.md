# Shopify API Setup Guide

This guide will help you set up Shopify API access to fetch product data for ambassador referrals.

## Step 1: Create Shopify Custom App

1. **Go to your Shopify Admin**
   - Visit: `https://admin.shopify.com/store/YOUR_STORE_NAME`

2. **Navigate to Apps**
   - Settings → Apps and sales channels → **Develop apps**

3. **Create a new app**
   - Click "Create an app"
   - App name: `Ambassador Year in Review`
   - Click "Create app"

4. **Configure API scopes**
   - Click "Configure Admin API scopes"
   - Enable these permissions:
     - ✅ `read_orders` - Read orders
     - ✅ `read_products` - Read products (optional but recommended)
   - Click "Save"

5. **Install the app**
   - Click "Install app" at the top
   - Confirm installation

6. **Get your Access Token**
   - Click "Reveal token once" under "Admin API access token"
   - **COPY THIS TOKEN NOW** - you won't be able to see it again!
   - Should look like: `shpat_abc123...`

7. **Get your store domain**
   - Your store domain is: `your-store-name.myshopify.com`
   - Find it in your browser URL or Shopify admin settings

## Step 2: Create .env File

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_actual_token_here
SHOPIFY_RATE_LIMIT=2
```

**Security Notes:**
- ✅ `.env` is in `.gitignore` - it won't be committed to GitHub
- ❌ Never share your access token publicly
- ❌ Never commit `.env` to version control

## Step 3: Fetch Product Data

Run the Shopify data fetcher:

```bash
node fetch-shopify-products.js
```

**What this does:**
- Reads all 28,705 referrals from the Excel file
- Extracts 26,633 unique Shopify order IDs
- Fetches product details from Shopify GraphQL API
- Saves results to `order-products.json`
- Implements rate limiting (2 requests/second by default)
- Auto-saves progress every 100 orders (resumable if interrupted)

**Expected time:** ~3-4 hours for 26,633 orders at 2 req/sec

**Progress indicators:**
```
Progress: 100/26633 (2 failed) - ETA: 215min
💾 Saved progress: 100 orders
```

**To resume:** Just run the command again - it will skip already-fetched orders

## Step 4: Add Top Models to Ambassador Data

Once product fetching is complete:

```bash
node add-top-models.js
```

**What this does:**
- Reads `order-products.json`
- Maps products to ambassadors
- Calculates top 3 most-referred models per ambassador
- Updates `ambassador-data.json` with top models
- Updates the public version in `ambassador-yir/public/`

**Output:**
```
✅ Updated 1,837 ambassadors with top models

📊 Sample results:

Chris Olson:
  1. Raw Carbon Fiber Paddle - 16mm (15 orders)
  2. Carbon Fiber Paddle - 14mm (8 orders)
  3. Kevlar Paddle - 16mm (3 orders)
```

## Step 5: Verify Data

Check that top models are added:

```bash
node -e "const data = require('./ambassador-data.json'); const sample = Object.values(data).find(a => a.topModels); console.log(JSON.stringify(sample.topModels, null, 2));"
```

## Rate Limiting

Shopify has API rate limits:
- Standard: **2 requests/second** (default)
- Shopify Plus: **4 requests/second**

To adjust:
```env
SHOPIFY_RATE_LIMIT=4  # for Shopify Plus
```

## Troubleshooting

### "Missing Shopify credentials" error
- Make sure `.env` file exists
- Check that credentials are correct
- No quotes needed around values in `.env`

### "HTTP 401 Unauthorized"
- Access token is invalid or expired
- Recreate the custom app and get a new token

### "GraphQL errors"
- Check that `read_orders` scope is enabled
- Some orders may be deleted/archived - these will be skipped

### Script is slow
- This is normal! 26,633 orders at 2 req/sec = ~3.7 hours
- Increase `SHOPIFY_RATE_LIMIT` if you have Shopify Plus
- Progress is auto-saved, safe to stop and resume

### Out of memory
- Process in smaller batches by modifying `BATCH_SIZE` in the script
- Or run overnight and let it complete

## Data Structure

After processing, ambassadors will have this data:

```json
{
  "name": "Ambassador Name",
  "topModels": [
    {
      "name": "Carbon Fiber Paddle - 16mm",
      "count": 15
    },
    {
      "name": "Kevlar Paddle - 14mm",
      "count": 8
    },
    {
      "name": "Raw Carbon Fiber Paddle - 16mm",
      "count": 5
    }
  ],
  ...
}
```

## Next Steps

After data is updated:
1. Frontend will automatically show top models (we'll add this UI)
2. Rebuild and redeploy to Cloudflare Pages
3. Ambassadors see their personalized product stats!

## Security & Privacy

- Order data is cached locally in `order-products.json`
- This file is `.gitignore`'d - won't be committed
- Only product names and counts are stored
- No customer PII (names, addresses, etc.) is saved
- Ambassador data includes product stats but no order details

## API Cost

- Shopify Admin API is **free** with your plan
- No additional cost for GraphQL queries
- Rate limits prevent abuse
