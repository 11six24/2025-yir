const XLSX = require('xlsx');
const fs = require('fs');

console.log('📦 Importing referrals to D1...\n');

// Read the referral Excel file
const workbook = XLSX.readFile('uppromote_referral_102736 (1).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const referrals = XLSX.utils.sheet_to_json(sheet);

console.log(`Found ${referrals.length} referrals\n`);

// Generate SQL
let sql = '-- Referrals Import\n\n';
sql += 'BEGIN TRANSACTION;\n\n';

referrals.forEach((ref, index) => {
  const escapeSql = (str) => {
    if (!str) return '';
    return String(str).replace(/'/g, "''");
  };

  const orderId = escapeSql(ref.order_id?.toString().trim() || '');
  const orderName = escapeSql(ref.order_name?.toString() || '');
  const email = escapeSql(ref.affiliate_email?.toLowerCase().trim() || '');
  const date = escapeSql(ref.date || '');
  const customerName = escapeSql(ref.customer_name || '');

  sql += `INSERT INTO referrals (order_id, order_name, affiliate_email, date, total_sales, commission, quantity_product, customer_name)\n`;
  sql += `VALUES ('${orderId}', '${orderName}', '${email}', '${date}', `;
  sql += `${ref.total_sales || 0}, ${ref.commission || 0}, ${ref.quantity_product || 0}, '${customerName}');\n`;

  if ((index + 1) % 1000 === 0) {
    console.log(`Generated SQL for ${index + 1}/${referrals.length} referrals...`);
  }
});

sql += '\nCOMMIT;\n\n';
sql += '-- Verification\n';
sql += 'SELECT COUNT(*) as total_referrals FROM referrals;\n';
sql += 'SELECT COUNT(DISTINCT affiliate_email) as unique_ambassadors FROM referrals;\n';
sql += 'SELECT COUNT(DISTINCT order_id) as unique_orders FROM referrals;\n';

fs.writeFileSync('d1-referrals-import.sql', sql);

console.log(`\n✅ Referrals import SQL generated!`);
console.log(`📄 File: d1-referrals-import.sql`);
console.log(`📊 Size: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`\nImport with: wrangler d1 execute ambassador-yir-db --file=d1-referrals-import.sql`);
