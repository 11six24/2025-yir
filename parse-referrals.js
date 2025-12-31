const XLSX = require('xlsx');
const fs = require('fs');

// Read the referral Excel file
const workbook = XLSX.readFile('uppromote_referral_102736 (1).xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Total referrals:', data.length);
console.log('\nFirst referral:');
console.log(JSON.stringify(data[0], null, 2));
console.log('\nAll column names:');
console.log(Object.keys(data[0]));

// Count unique orders and ambassadors
const uniqueOrders = new Set(data.map(r => r.order_number || r.order_id || r.order)).size;
const uniqueEmails = new Set(data.map(r => r.email || r.affiliate_email)).size;

console.log(`\nUnique orders: ${uniqueOrders}`);
console.log(`Unique ambassador emails: ${uniqueEmails}`);

// Show sample of 5 referrals
console.log('\nSample referrals (first 5):');
data.slice(0, 5).forEach((ref, i) => {
  console.log(`${i + 1}.`, ref);
});
