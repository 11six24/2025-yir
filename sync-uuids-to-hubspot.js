// Script to sync ambassador UUIDs to HubSpot contact property
// Only syncs ambassadors who have 1+ referrals in 2025

const https = require('https');
require('dotenv').config();

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

if (!HUBSPOT_API_KEY) {
  console.error('❌ Error: HUBSPOT_API_KEY not found in .env file');
  console.log('Please add: HUBSPOT_API_KEY=your_api_key_here');
  process.exit(1);
}

// Load ambassador data
const fs = require('fs');
const ambassadorData = JSON.parse(fs.readFileSync('./ambassador-data.json', 'utf8'));

// Load referrals data to check who has referrals
const xlsx = require('xlsx');
const workbook = xlsx.readFile('./uppromote_referral_102736 (1).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const referrals = xlsx.utils.sheet_to_json(sheet);

// Count referrals per ambassador email
const referralCounts = {};
referrals.forEach(row => {
  const email = row['Affiliate Email']?.toLowerCase().trim();
  if (email) {
    referralCounts[email] = (referralCounts[email] || 0) + 1;
  }
});

console.log(`📊 Found ${Object.keys(referralCounts).length} ambassadors with referrals`);

// Filter ambassadors who have referrals
const ambassadorsWithReferrals = Object.entries(ambassadorData)
  .filter(([uuid, data]) => {
    const email = data.email.toLowerCase().trim();
    return referralCounts[email] && referralCounts[email] > 0;
  })
  .map(([uuid, data]) => ({
    uuid,
    email: data.email.toLowerCase().trim(),
    name: data.name,
    referralCount: referralCounts[data.email.toLowerCase().trim()]
  }));

console.log(`✅ ${ambassadorsWithReferrals.length} ambassadors qualify for UUID sync\n`);

// HubSpot API helper
function updateHubSpotContact(email, uuid) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      properties: {
        ambassador_2025_yir_uuid: uuid
      }
    });

    const options = {
      hostname: 'api.hubapi.com',
      path: `/crm/v3/objects/contacts/${email}?idProperty=email`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, email });
        } else if (res.statusCode === 404) {
          resolve({ success: false, email, error: 'Contact not found in HubSpot' });
        } else {
          resolve({ success: false, email, error: `HTTP ${res.statusCode}: ${responseData}` });
        }
      });
    });

    req.on('error', (error) => {
      reject({ success: false, email, error: error.message });
    });

    req.write(data);
    req.end();
  });
}

// Sync to HubSpot with rate limiting
async function syncToHubSpot() {
  let successCount = 0;
  let failureCount = 0;
  let notFoundCount = 0;

  console.log('🚀 Starting sync to HubSpot...\n');

  for (let i = 0; i < ambassadorsWithReferrals.length; i++) {
    const ambassador = ambassadorsWithReferrals[i];

    try {
      const result = await updateHubSpotContact(ambassador.email, ambassador.uuid);

      if (result.success) {
        successCount++;
        console.log(`✅ [${i + 1}/${ambassadorsWithReferrals.length}] ${ambassador.name} (${ambassador.email})`);
      } else if (result.error.includes('not found')) {
        notFoundCount++;
        console.log(`⚠️  [${i + 1}/${ambassadorsWithReferrals.length}] Not in HubSpot: ${ambassador.email}`);
      } else {
        failureCount++;
        console.log(`❌ [${i + 1}/${ambassadorsWithReferrals.length}] Failed: ${ambassador.email} - ${result.error}`);
      }

      // Rate limit: HubSpot allows 100 requests per 10 seconds for API key auth
      // We'll do 10 per second to be safe
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      failureCount++;
      console.log(`❌ [${i + 1}/${ambassadorsWithReferrals.length}] Error: ${ambassador.email} - ${error.error || error.message}`);
    }
  }

  console.log('\n📊 Sync Complete:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⚠️  Not found: ${notFoundCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📈 Total: ${ambassadorsWithReferrals.length}`);
}

// Run the sync
syncToHubSpot().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
