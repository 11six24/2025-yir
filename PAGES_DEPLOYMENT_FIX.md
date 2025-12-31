# Cloudflare Pages Deployment Fix

## Issue
Functions were not deploying because they were in the wrong location. The error "We couldn't find your Year in Review" appeared because the API endpoints weren't available.

## What Changed
1. **Moved `functions/` folder** from project root to `ambassador-yir/functions/`
2. **Added `_routes.json`** to explicitly define API routes
3. **Updated `wrangler.toml`** with proper configuration

## Project Structure (FIXED)

```
2025_ambassador_YIR/
├── ambassador-yir/               ← Your Vite app (this is the build root)
│   ├── dist/                     ← Build output (created by npm run build)
│   ├── functions/                ← Cloudflare Pages Functions ✅
│   │   └── api/
│   │       ├── ambassador/
│   │       │   └── [uuid].js     ← Main API endpoint
│   │       └── process-ambassador.js  ← Background job
│   ├── public/
│   │   ├── _routes.json          ← Route configuration ✅ NEW
│   │   └── vite.svg
│   ├── src/
│   ├── wrangler.toml             ← D1 configuration ✅
│   ├── package.json
│   └── index.html
└── (other files at root level)
```

## Cloudflare Pages Settings

### Build Configuration

Go to your Cloudflare Pages project > **Settings** > **Builds & deployments**

**Framework preset:** Vite

**Build command:**
```bash
cd ambassador-yir && npm install && npm run build
```

**Build output directory:**
```
ambassador-yir/dist
```

**Root directory (Path):**
```
ambassador-yir
```
☝️ **IMPORTANT:** Set this to `ambassador-yir` (not blank, not `/`)

### Environment Variables

Go to **Settings** > **Environment variables**

Add these for **Production** environment:

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_admin_api_access_token
```

### D1 Database Binding

Go to **Settings** > **Functions** > **D1 database bindings**

Click **Add binding:**
- **Variable name:** `DB`
- **D1 database:** `ambassador-yir-db`

## Deploy

1. **Commit and push changes:**
```bash
git add .
git commit -m "Fix functions deployment structure"
git push
```

2. **In Cloudflare Pages:**
   - Go to your project
   - Click **Deployments** tab
   - Wait for build to complete

3. **Verify Functions Deployed:**
   - After build completes, go to **Functions** tab
   - You should now see:
     - `GET /api/ambassador/:uuid`
     - `POST /api/process-ambassador`

## Testing

Test with a real ambassador UUID:

```
https://your-site.pages.dev/api/ambassador/54537609-4b5d-44b9-8aeb-c755f0ed07c8
```

Should return JSON with ambassador data.

Test the Year in Review page:

```
https://your-site.pages.dev/yir/54537609-4b5d-44b9-8aeb-c755f0ed07c8
```

Should load the full experience.

## Troubleshooting

### Functions Still Not Showing

1. **Check Root Directory setting** - must be `ambassador-yir`
2. **Rebuild** - Click "Retry deployment" in Cloudflare
3. **Check build logs** for errors in Functions section

### "Ambassador not found" Error

This means the API is working but can't find data:
1. Verify D1 binding is set to `DB` (exact name)
2. Check D1 has data: `npx wrangler d1 execute ambassador-yir-db --remote --command="SELECT COUNT(*) FROM ambassadors"`

### Functions Timeout

If background jobs timeout:
1. Check Shopify credentials are correct
2. Reduce order limit in `functions/api/process-ambassador.js` line 186

## What the Functions Do

### `/api/ambassador/[uuid]`
- Main API endpoint
- Returns ambassador stats, archetype, timeline
- Checks for top models
- Triggers background job if needed
- Returns status: `loading`, `ready`, or `none`

### `/api/process-ambassador`
- Background job (POST only)
- Fetches orders from Shopify
- Calculates top 3 products
- Saves to D1
- Rate limited to 7 req/sec

### `_routes.json`
- Tells Cloudflare which routes should go to functions
- Ensures `/api/*` and `/yir/*` are properly routed
