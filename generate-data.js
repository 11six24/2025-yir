const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('uppromote_top_affiliate_102736 (16).xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

// Filter active ambassadors (those with at least 1 order or clicks)
const activeAmbassadors = data.filter(a => a.total_order > 0 || a.clicks > 0);

// Calculate percentiles for ranking
const sortedByRevenue = [...activeAmbassadors].sort((a, b) => b.revenue - a.revenue);
const sortedByOrders = [...activeAmbassadors].sort((a, b) => b.total_order - a.total_order);
const sortedByClicks = [...activeAmbassadors].sort((a, b) => b.clicks - a.clicks);

function getPercentile(ambassador, sortedArray) {
  const index = sortedArray.findIndex(a => a.id === ambassador.id);
  return Math.round((1 - index / sortedArray.length) * 100);
}

function getArchetype(ambassador, revenuePercentile, ordersPercentile, clicksPercentile) {
  const conversionRate = ambassador.clicks > 0 ? (ambassador.total_order / ambassador.clicks) : 0;

  if (revenuePercentile >= 90) return { title: "The Revenue Machine", description: "You consistently drove high-value sales that made a real impact." };
  if (ordersPercentile >= 90) return { title: "The Conversion Champion", description: "You turned interest into action with incredible conversion power." };
  if (clicksPercentile >= 90) return { title: "The Traffic Magnet", description: "You brought massive awareness and drove serious attention to the brand." };
  if (revenuePercentile >= 75) return { title: "The Top Tier Ambassador", description: "You're in the elite group driving real results." };
  if (conversionRate > 0.1) return { title: "The Closer", description: "When you share, people buy. Simple as that." };
  if (ordersPercentile >= 50) return { title: "The Steady Performer", description: "Consistent, reliable, and always delivering results." };
  if (clicksPercentile >= 50) return { title: "The Community Builder", description: "You brought new eyes to the brand and grew our reach." };
  return { title: "The Ambassador", description: "You're part of something special." };
}

function getBestMonth(ambassador) {
  // Simplified - could parse last_order date
  if (ambassador.last_order) {
    const date = new Date(ambassador.last_order);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  return "2025";
}

// Generate ambassador profiles with UUIDs
const ambassadorProfiles = {};
const emailToUUID = {};

activeAmbassadors.forEach(ambassador => {
  const uuid = uuidv4();
  const revenuePercentile = getPercentile(ambassador, sortedByRevenue);
  const ordersPercentile = getPercentile(ambassador, sortedByOrders);
  const clicksPercentile = getPercentile(ambassador, sortedByClicks);
  const archetype = getArchetype(ambassador, revenuePercentile, ordersPercentile, clicksPercentile);

  const profile = {
    name: ambassador.affiliate_name,
    email: ambassador.email,
    stats: {
      revenue: ambassador.revenue,
      orders: ambassador.total_order,
      clicks: ambassador.clicks,
      commission: ambassador.commission,
    },
    ranking: {
      overall: Math.max(revenuePercentile, ordersPercentile),
      revenue: revenuePercentile,
      orders: ordersPercentile,
      clicks: clicksPercentile,
    },
    archetype: archetype,
    milestones: {
      bestMonth: getBestMonth(ambassador),
      firstOrder: ambassador.registration_time,
      totalLogins: ambassador.login_count,
      lastActive: ambassador.last_login,
    },
    program: ambassador.program,
  };

  ambassadorProfiles[uuid] = profile;
  emailToUUID[ambassador.email.toLowerCase()] = uuid;
});

// Save data files
fs.writeFileSync('ambassador-data.json', JSON.stringify(ambassadorProfiles, null, 2));
fs.writeFileSync('email-lookup.json', JSON.stringify(emailToUUID, null, 2));

console.log(`✅ Generated ${Object.keys(ambassadorProfiles).length} ambassador profiles`);
console.log(`📊 Data saved to ambassador-data.json`);
console.log(`📧 Email lookup saved to email-lookup.json`);
console.log(`\nSample UUID for testing: ${Object.keys(ambassadorProfiles)[0]}`);
