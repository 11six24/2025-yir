# Top Models Feature - Setup Guide

## 🎯 What This Feature Does

Enhances the Year in Review with **personalized product insights**. Each ambassador now sees:
- Their top 3 most-referred paddle models
- How many orders they generated for each model
- Beautiful animated display between Timeline and Thank You screens

## 📦 What Was Built

### 1. Backend Scripts

**`parse-referrals.js`**
- Parses the referral Excel file
- Extracts 28,705 referrals with order IDs
- Shows data structure and statistics

**`fetch-shopify-products.js`**
- Connects to Shopify GraphQL API
- Fetches product details for 26,633 unique orders
- Implements smart rate limiting (2 req/sec default)
- Auto-saves progress every 100 orders
- Fully resumable if interrupted

**`add-top-models.js`**
- Maps products to ambassadors
- Calculates top 3 models per ambassador
- Updates ambassador-data.json
- Shows statistics and examples

### 2. Frontend Components

**`TopModelsScreen.jsx`**
- New screen in the Year in Review flow
- Displays top 3 models with animated reveals
- Shows model names and order counts
- Automatically skips if no product data

**Updated Flow:**
1. Welcome
2. Stats
3. Archetype
4. Timeline
5. **Top Models** ← NEW!
6. Thank You
7. Share
8. Final

### 3. Documentation

- `SHOPIFY_SETUP.md` - Complete Shopify API setup guide
- `.env.example` - Template for API credentials
- Updated `.gitignore` - Protects sensitive data

## 🚀 Quick Start

### Step 1: Set Up Shopify API

Follow the detailed guide in `SHOPIFY_SETUP.md`:

1. Create a Shopify custom app
2. Enable `read_orders` scope
3. Get your Admin API access token
4. Create `.env` file with credentials

```bash
cp .env.example .env
# Edit .env and add your credentials
```

### Step 2: Fetch Product Data

This will take ~3-4 hours for all 26,633 orders:

```bash
node fetch-shopify-products.js
```

**Features:**
- Progress indicators every 10 orders
- Auto-saves every 100 orders
- Resume from where it stopped
- Safe to run overnight

**Output:** `order-products.json` (cached API responses)

### Step 3: Add Top Models to Ambassador Data

```bash
node add-top-models.js
```

**This will:**
- Process all order-product data
- Find top 3 models per ambassador
- Update `ambassador-data.json`
- Update `ambassador-yir/public/ambassador-data.json`

**Output:**
```
✅ Updated 1,837 ambassadors with top models

Chris Olson:
  1. Raw Carbon Fiber Paddle - 16mm (15 orders)
  2. Carbon Fiber Paddle - 14mm (8 orders)
  3. Kevlar Paddle - 16mm (3 orders)
```

### Step 4: Test Locally

Your dev server should auto-reload:

```
http://localhost:5173/YOUR_UUID
```

Navigate through the screens to see the new "Top Models" section!

## 📊 Data Structure

Ambassadors with product data now have:

```json
{
  "name": "Ambassador Name",
  "email": "email@example.com",
  "stats": { ... },
  "ranking": { ... },
  "archetype": { ... },
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
  ]
}
```

## ⚡ Rate Limiting

Shopify API limits:
- **Standard**: 2 requests/second (default)
- **Shopify Plus**: 4 requests/second

To adjust for Shopify Plus:
```env
SHOPIFY_RATE_LIMIT=4
```

**Calculation:**
- 26,633 orders ÷ 2 req/sec = ~3.7 hours
- 26,633 orders ÷ 4 req/sec = ~1.8 hours (Plus)

## 🎨 Frontend Display

The TopModelsScreen component:
- Shows rank badges (#1, #2, #3)
- Model names with gradient text
- Order counts in teal
- Smooth slide-in animations
- Hover effects on cards
- Mobile responsive

## 🔒 Security & Privacy

**Protected Files (in .gitignore):**
- `.env` - API credentials
- `order-products.json` - Cached Shopify data
- `uppromote_referral_102736 (1).xlsx` - Source data

**What's Safe to Commit:**
- `ambassador-data.json` - Contains aggregated stats only
- Frontend code - No sensitive data
- Scripts - No hardcoded credentials

**Privacy:**
- No customer PII stored
- Only product names and counts
- No order details or customer data

## 🚨 Troubleshooting

### Script fails with "Missing Shopify credentials"
→ Create `.env` file with your credentials (see `.env.example`)

### "HTTP 401 Unauthorized"
→ Access token is invalid, recreate the custom app

### Script is very slow
→ This is normal! Increase `SHOPIFY_RATE_LIMIT` if you have Shopify Plus

### Out of memory
→ Reduce `BATCH_SIZE` in `fetch-shopify-products.js`

### Ambassador missing top models
→ They may not have any referrals in the data, screen auto-skips

## 📈 Expected Results

Based on the data:
- **28,705** total referrals
- **26,633** unique orders
- **1,837** unique ambassadors
- **~70-80%** of ambassadors will have top models data

Ambassadors without referrals in the Excel file will skip the Top Models screen automatically.

## 🔄 Updating Data

To refresh product data:

```bash
# Fetch latest orders
node fetch-shopify-products.js

# Update ambassador data
node add-top-models.js

# Rebuild frontend
cd ambassador-yir
npm run build

# Deploy to Cloudflare (if using GitHub)
git add .
git commit -m "Update: Refreshed top models data"
git push origin main
```

## 🎯 What's Next

After setup:
1. ✅ Top models display in Year in Review
2. ✅ Ambassadors see their most successful products
3. ✅ More personalized, engaging experience
4. ✅ Social sharing shows authentic product advocacy

## 💡 Future Enhancements

Potential additions:
- Add product images to top models screen
- Show revenue per model
- Trending products badge
- Year-over-year model comparisons
- Share cards with top model highlights

## 📞 Support

Issues? Check:
1. `SHOPIFY_SETUP.md` for API setup
2. Script logs for specific errors
3. Console in browser for frontend issues

---

**Estimated setup time**: 5-10 minutes (+ 3-4 hours API fetching in background)
