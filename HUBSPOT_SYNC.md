# HubSpot UUID Sync Guide

This script syncs ambassador UUIDs to HubSpot contact properties, but **only for ambassadors who have 1 or more referrals** in 2025.

## Prerequisites

### 1. Create HubSpot Contact Property

First, create the custom contact property in HubSpot:

1. Go to **HubSpot Settings** → **Data Management** → **Properties**
2. Click **Create property**
3. Select object type: **Contact**
4. Configure the property:
   - **Label**: `2025 Year in Review UUID`
   - **Internal name**: `ambassador_2025_yir_uuid`
   - **Description**: `Unique identifier for the 2025 Ambassador Year in Review experience`
   - **Field type**: `Single-line text`
   - **Group**: Select or create "Ambassador Program"
5. Click **Create**

### 2. Get HubSpot API Key

**Option A: Use API Key (Easier)**
1. Go to **Settings** → **Integrations** → **API Key**
2. Click **Show** or **Create key**
3. Copy the API key

**Option B: Create Private App (More secure)**
1. Go to **Settings** → **Integrations** → **Private Apps**
2. Click **Create a private app**
3. Name it "2025 Ambassador YIR Sync"
4. Go to **Scopes** tab
5. Enable: `crm.objects.contacts.write`
6. Click **Create app**
7. Copy the access token

### 3. Add to .env File

Add your HubSpot API key to `.env`:

```bash
HUBSPOT_API_KEY=your_api_key_or_private_app_token_here
```

## How It Works

The script will:

1. ✅ Load all ambassadors from `ambassador-data.json`
2. ✅ Load referrals from the Excel file
3. ✅ Count referrals per ambassador email
4. ✅ Filter to only ambassadors with **1 or more referrals**
5. ✅ Update HubSpot contact property `ambassador_2025_yir_uuid` for each qualifying ambassador
6. ✅ Skip ambassadors with 0 referrals (they won't get a UUID synced)

**Rate Limiting:**
- 10 requests per second (safe for HubSpot's 100 req/10sec limit)
- Should complete ~400 contacts in under 1 minute

## Run the Script

```bash
node sync-uuids-to-hubspot.js
```

## Output Example

```
📊 Found 312 ambassadors with referrals
✅ 312 ambassadors qualify for UUID sync

🚀 Starting sync to HubSpot...

✅ [1/312] David Groechel (david@11six24.com)
✅ [2/312] Chris Olson (thepickleballstudio@gmail.com)
⚠️  [3/312] Not in HubSpot: newambassador@example.com
✅ [4/312] John Smith (john@example.com)
...

📊 Sync Complete:
   ✅ Success: 289
   ⚠️  Not found: 23
   ❌ Failed: 0
   📈 Total: 312
```

## What Gets Synced

**ONLY** ambassadors who have:
- ✅ At least 1 referral in the `uppromote_referral_102736 (1).xlsx` file
- ✅ A matching email in HubSpot contacts

**NOT synced:**
- ❌ Ambassadors with 0 referrals
- ❌ Ambassadors not found in HubSpot (creates warning but continues)

## After Syncing

### Create HubSpot List

Create a list of ambassadors to email:

1. Go to **Contacts** → **Lists**
2. Click **Create list** → **Contact-based**
3. Name it: "2025 YIR - Ambassadors with Referrals"
4. Add filter:
   - `2025 Year in Review UUID` → `is known`
5. Save

### Create Email with Personalized Links

In your HubSpot email:

```
Hi {{ contact.firstname }},

Your 2025 Year in Review is ready!

See your ambassador impact:
https://your-site.pages.dev/yir/{{ contact.ambassador_2025_yir_uuid }}

Thanks for being an amazing ambassador!
```

The `{{ contact.ambassador_2025_yir_uuid }}` token will automatically insert each ambassador's unique UUID.

## Troubleshooting

### Error: "HUBSPOT_API_KEY not found"
- Make sure you added `HUBSPOT_API_KEY=...` to your `.env` file
- Restart the script after adding the key

### Warning: "Not in HubSpot: email@example.com"
- This ambassador exists in your data but not in HubSpot
- They won't receive an email (which is fine)
- The script continues processing others

### Error: "Contact property not found"
- Make sure you created the property with exact name: `ambassador_2025_yir_uuid`
- Property must be on Contact object, not Company

### Error: HTTP 401 Unauthorized
- Your API key is invalid or expired
- Check you copied the full key
- Try regenerating the API key in HubSpot

### Error: HTTP 429 Too Many Requests
- The script is rate limited at 10 req/sec
- If you still hit this, reduce the delay in line 110 from 100ms to 200ms

## Stats

From your data:
- **Total ambassadors**: 2,409
- **Ambassadors with referrals**: ~312 (estimated)
- **Will be synced to HubSpot**: Only those found in HubSpot (likely 280-300)

## Re-running

Safe to run multiple times:
- ✅ Updates existing UUIDs (idempotent)
- ✅ Won't create duplicates
- ✅ Only syncs ambassadors with referrals each time

## Production Checklist

Before sending emails:

- [ ] Custom property `ambassador_2025_yir_uuid` created in HubSpot
- [ ] Script ran successfully (check output)
- [ ] Created HubSpot list with filter: "UUID is known"
- [ ] List count matches expected number (~300 contacts)
- [ ] Test email sent to yourself with personalization token
- [ ] Clicked test link to verify it works
- [ ] Year in Review site is deployed and working
- [ ] D1 database has all ambassador data
- [ ] Shopify environment variables configured in Cloudflare Pages
