# Troubleshooting - Top Models Not Loading

## Quick Diagnostic Steps

### 1. Test if Functions are deployed

After your next deployment, visit:
```
https://your-site.pages.dev/api/test
```

You should see JSON like:
```json
{
  "functionsWorking": true,
  "hasDB": true,
  "hasShopifyDomain": true,
  "hasShopifyToken": true,
  "dbConnected": true,
  "ambassadorCount": 2409
}
```

**If you get 404:** Functions didn't deploy properly.
**If hasDB is false:** D1 binding not configured.
**If hasShopify* is false:** Environment variables not set.
**If dbConnected is false:** D1 binding name is wrong or database doesn't exist.

---

## Cloudflare Pages Checklist

### Settings > Builds & deployments

**Root directory (Path):**
```
ambassador-yir
```
☝️ **CRITICAL** - Must be set to exactly `ambassador-yir`, not blank!

**Build command:**
```
npm install && npm run build
```

**Build output directory:**
```
dist
```

---

### Settings > Environment variables

Click **Add variables** and add these for **Production**:

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
```

Then click **Save**.

---

### Settings > Functions > D1 database bindings

Click **Add binding**:

- **Variable name:** `DB` (exactly this, case-sensitive)
- **D1 database:** Select `ambassador-yir-db`

Click **Save**.

---

## Verify Deployment

### 1. Check Functions Tab

After deployment, go to your project > **Functions** tab.

You should see:
- `GET /api/test`
- `GET /api/ambassador/:uuid`
- `POST /api/process-ambassador`

**If empty:** Root directory is wrong or Functions didn't deploy.

### 2. Check Build Logs

Go to **Deployments** > Click your latest deployment > **Build logs**

Look for:
```
✨ Compiled Worker successfully
```

And in the Functions section:
```
✨ /api/test
✨ /api/ambassador/[uuid]
✨ /api/process-ambassador
```

### 3. Test the API Directly

Open a new browser tab and go to:
```
https://your-site.pages.dev/api/ambassador/54537609-4b5d-44b9-8aeb-c755f0ed07c8
```

**Should return JSON** with:
```json
{
  "name": "David Groechel",
  "email": "david@11six24.com",
  "stats": { ... },
  "topModelsStatus": "loading" or "none" or "ready"
}
```

**If you get:**
- **404:** Functions not deployed or routes not configured
- **500:** D1 binding issue or environment variable missing
- **"Not found":** UUID doesn't exist in database

---

## Common Issues

### Issue: "We couldn't find your Year in Review"

**Cause:** Frontend is trying to load from `/ambassador-data.json` (doesn't exist) instead of API.

**Fix:** Check browser Developer Console > Network tab. Should see request to `/api/ambassador/[uuid]`, not `ambassador-data.json`.

### Issue: Functions Tab is Empty

**Cause:** Root directory not set correctly.

**Fix:**
1. Settings > Builds & deployments
2. Set **Root directory** to `ambassador-yir`
3. Save and redeploy

### Issue: Top Models Shows "Loading..." Forever

**Cause:** Background job failing (Shopify credentials missing/wrong).

**Fix:**
1. Check environment variables are set correctly
2. Check Functions logs for errors
3. Try the `/api/test` endpoint to verify credentials

### Issue: Top Models Don't Load at All

**Possible causes:**
- Ambassador has no referrals
- Background job hasn't run yet
- Shopify API credentials wrong

**Debug:**
Check Functions logs in Cloudflare dashboard for errors.

---

## Steps to Fix Right Now

1. **Commit the test endpoint:**
```bash
git add .
git commit -m "Add diagnostic test endpoint"
git push
```

2. **In Cloudflare Pages:**
   - Go to Settings > Builds & deployments
   - **Verify Root directory is set to: `ambassador-yir`**
   - Go to Settings > Environment variables
   - Add Shopify credentials if not already there
   - Go to Settings > Functions
   - Add D1 binding if not already there

3. **Trigger a new deployment:**
   - Go to Deployments tab
   - Click "Retry deployment"
   - Wait for it to complete

4. **Test the diagnostic endpoint:**
   - Visit: `https://your-site.pages.dev/api/test`
   - Share the JSON output with me

5. **Check the Functions tab:**
   - Should show 3 functions listed

Once we see the output from `/api/test`, we'll know exactly what's misconfigured.
