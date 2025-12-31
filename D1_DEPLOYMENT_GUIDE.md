# D1 Database Deployment Guide

## 🔒 Why D1?

D1 provides **secure, private data access** - no more public JSON files that can be scraped. Each ambassador's data is only served when they access their unique UUID link.

## 📋 Complete Workflow (After Shopify Fetch Completes)

### Step 1: Fetch Product Images (~30 minutes)

After `fetch-shopify-products.js` completes:

```bash
node fetch-product-images.js
```

**What it does:**
- Reads all unique products from `order-products.json`
- Fetches product images from Shopify (one per unique product)
- Caches results in `product-image-cache.json`
- Skips already-cached images (resumable)

**Expected:**
- ~200-300 unique products to fetch
- ~30-60 minutes at 5 req/sec
- Images cached forever (won't refetch)

### Step 2: Add Top Models with Images

```bash
node add-top-models.js
```

**What it does:**
- Reads cached product images
- Calculates top 3 models per ambassador
- Adds product names, counts, AND images
- Updates `ambassador-data.json`

### Step 3: Generate D1 Migration

```bash
node migrate-to-d1.js
```

**What it does:**
- Reads `ambassador-data.json`
- Generates SQL INSERT statements
- Creates `d1-migration.sql` (~1.6 MB)

### Step 4: Create D1 Database

```bash
wrangler d1 create ambassador-yir-db
```

**Output:**
```
✅ Successfully created DB 'ambassador-yir-db'!

[[d1_databases]]
binding = "DB"
database_name = "ambassador-yir-db"
database_id = "xxxx-xxxx-xxxx-xxxx"
```

**Copy the `database_id`** - you'll need it!

### Step 5: Update wrangler.toml

Create/edit `wrangler.toml` in project root:

```toml
name = "ambassador-yir-2025"
compatibility_date = "2025-01-01"

[[d1_databases]]
binding = "DB"
database_name = "ambassador-yir-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Paste from Step 4
```

### Step 6: Import Schema

```bash
wrangler d1 execute ambassador-yir-db --file=d1-schema.sql
```

Creates tables:
- `ambassadors` - Main data table
- `top_models` - Product images and counts
- Indexes for fast lookups

### Step 7: Import Data

```bash
wrangler d1 execute ambassador-yir-db --file=d1-migration.sql
```

**This takes ~5-10 minutes** for 2,409 ambassadors + top models.

**Verify:**
```bash
wrangler d1 execute ambassador-yir-db --command="SELECT COUNT(*) as total FROM ambassadors"
```

Should return: `2409`

### Step 8: Test Locally (Optional)

```bash
cd ambassador-yir
wrangler pages dev dist --d1=DB:ambassador-yir-db
```

Then open: `http://localhost:8788/{uuid}`

### Step 9: Deploy to Production

```bash
# Build the frontend
cd ambassador-yir
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=ambassador-yir-2025

# Or via GitHub (recommended)
git add .
git commit -m "Add D1 database and product images"
git push origin main
```

### Step 10: Configure D1 in Cloudflare Dashboard

1. Go to Cloudflare Pages dashboard
2. Select your project: `ambassador-yir-2025`
3. Go to **Settings** → **Functions**
4. Under **D1 Databases**, click **Add binding**
5. Variable name: `DB`
6. D1 database: `ambassador-yir-db`
7. Click **Save**

### Step 11: Redeploy

Trigger a redeploy so the binding takes effect:

```bash
wrangler pages deploy dist --project-name=ambassador-yir-2025
```

Or push to GitHub again.

### Step 12: Generate Ambassador Links

```bash
# Update generate-links.js with your domain
# Then run:
node generate-links.js
```

Creates `ambassador-links.csv` with UUID links for all ambassadors.

## 🎯 Data Flow

### Development (localhost)
```
Frontend → /ambassador-data.json → Static file
```

### Production
```
Frontend → /api/ambassador/{uuid} → D1 Database → Secure API response
```

## 🔐 Security Benefits

**Before (JSON files):**
- ❌ All data publicly accessible
- ❌ Can be scraped easily
- ❌ Emails visible to anyone

**After (D1):**
- ✅ Only requested ambassador's data returned
- ✅ Can't bulk scrape all ambassadors
- ✅ Can add rate limiting
- ✅ Can log access attempts
- ✅ Emails protected in database

## 📊 Database Schema

### Ambassadors Table
```sql
- uuid (Primary Key)
- name, email, program
- revenue, orders, clicks, commission
- ranking_overall, ranking_revenue, ranking_orders, ranking_clicks
- archetype_title, archetype_description
- first_order, best_month, total_logins, last_active
```

### Top Models Table
```sql
- id (Auto Increment)
- ambassador_uuid (Foreign Key)
- rank (1, 2, or 3)
- product_name
- product_image_url  ← Shopify CDN URL
- count
```

## 🖼️ Product Images

Images are stored as Shopify CDN URLs:
- `https://cdn.shopify.com/s/files/.../product-image.jpg`
- Cached in Shopify's global CDN
- Fast loading worldwide
- No storage cost on your end

## 🚀 Performance

**D1 Query Speed:**
- Average: 10-50ms per request
- Global edge database
- Auto-cached at Cloudflare edge

**Frontend Load:**
- Single API request per UUID
- ~5-10 KB response size
- Cached for 1 hour (configurable)

## 🔄 Updating Data

To refresh data in the future:

```bash
# 1. Re-fetch Shopify orders (if needed)
node fetch-shopify-products.js

# 2. Re-fetch product images (new products only)
node fetch-product-images.js

# 3. Update ambassador data
node add-top-models.js

# 4. Regenerate migration
node migrate-to-d1.js

# 5. Clear and reimport D1
wrangler d1 execute ambassador-yir-db --command="DELETE FROM top_models"
wrangler d1 execute ambassador-yir-db --command="DELETE FROM ambassadors"
wrangler d1 execute ambassador-yir-db --file=d1-migration.sql

# 6. Redeploy
cd ambassador-yir
npm run build
wrangler pages deploy dist --project-name=ambassador-yir-2025
```

## 🐛 Troubleshooting

### "Database binding not found"
→ Add D1 binding in Cloudflare dashboard (Step 10)

### "Table already exists"
→ Skip schema import, data is already there

### "Frontend shows error screen"
→ Check browser console for API errors
→ Verify D1 binding is configured
→ Check UUID is valid

### "Product images not showing"
→ Run `fetch-product-images.js` before `add-top-models.js`
→ Check `product-image-cache.json` exists

## 📁 File Structure

```
/
├── d1-schema.sql              # Database schema
├── d1-migration.sql           # Generated data (gitignored)
├── fetch-product-images.js    # Image cacher
├── product-image-cache.json   # Cached images (gitignored)
├── add-top-models.js          # Updated to use image cache
├── migrate-to-d1.js           # Generates migration SQL
├── functions/
│   └── api/
│       └── ambassador/
│           └── [uuid].js      # D1 API endpoint
├── ambassador-yir/
│   └── src/
│       └── pages/
│           └── YearInReview.jsx  # Auto-detects dev/prod
└── wrangler.toml              # D1 binding config
```

## ✅ Checklist

- [ ] Shopify fetch completed (`order-products.json` exists)
- [ ] Product images fetched (`product-image-cache.json` exists)
- [ ] Top models added to ambassador data (with images)
- [ ] D1 database created
- [ ] Schema imported
- [ ] Data migrated
- [ ] D1 binding configured in Cloudflare
- [ ] Deployed to production
- [ ] Tested with a real UUID
- [ ] Generated ambassador links CSV

---

**Estimated total setup time:** 2-3 hours (mostly waiting for Shopify fetch)
**One-time setup:** Yes, data persists in D1
**Future updates:** Quick (~15 minutes to refresh data)
