const fs = require('fs');

console.log('📦 Generating D1 migration SQL from ambassador data...\n');

// Load ambassador data
const ambassadorData = JSON.parse(fs.readFileSync('ambassador-data.json', 'utf8'));

const ambassadors = Object.entries(ambassadorData);
console.log(`Found ${ambassadors.length} ambassadors to migrate\n`);

// Generate SQL statements
let sql = '';

// Add initial setup
sql += '-- D1 Database Migration\n';
sql += '-- Generated from ambassador-data.json\n\n';

sql += 'BEGIN TRANSACTION;\n\n';

// Insert ambassadors
ambassadors.forEach(([uuid, data], index) => {
  // Escape single quotes in data
  const escapeSql = (str) => {
    if (!str) return '';
    return String(str).replace(/'/g, "''");
  };

  const name = escapeSql(data.name);
  const email = escapeSql(data.email);
  const program = escapeSql(data.program || '');
  const archetypeTitle = escapeSql(data.archetype?.title || '');
  const archetypeDesc = escapeSql(data.archetype?.description || '');
  const firstOrder = escapeSql(data.milestones?.firstOrder || '');
  const bestMonth = escapeSql(data.milestones?.bestMonth || '');
  const lastActive = escapeSql(data.milestones?.lastActive || '');

  sql += `-- Ambassador ${index + 1}: ${data.name}\n`;
  sql += `INSERT INTO ambassadors (uuid, name, email, program, revenue, orders, clicks, commission, `;
  sql += `ranking_overall, ranking_revenue, ranking_orders, ranking_clicks, `;
  sql += `archetype_title, archetype_description, first_order, best_month, total_logins, last_active)\n`;
  sql += `VALUES ('${uuid}', '${name}', '${email}', '${program}', `;
  sql += `${data.stats?.revenue || 0}, ${data.stats?.orders || 0}, ${data.stats?.clicks || 0}, ${data.stats?.commission || 0}, `;
  sql += `${data.ranking?.overall || 0}, ${data.ranking?.revenue || 0}, ${data.ranking?.orders || 0}, ${data.ranking?.clicks || 0}, `;
  sql += `'${archetypeTitle}', '${archetypeDesc}', '${firstOrder}', '${bestMonth}', `;
  sql += `${data.milestones?.totalLogins || 0}, '${lastActive}');\n\n`;

  // Insert top models if they exist
  if (data.topModels && data.topModels.length > 0) {
    data.topModels.forEach((model, rank) => {
      const modelName = escapeSql(model.name);
      sql += `INSERT INTO top_models (ambassador_uuid, rank, product_name, count)\n`;
      sql += `VALUES ('${uuid}', ${rank + 1}, '${modelName}', ${model.count});\n`;
    });
    sql += '\n';
  }

  // Progress indicator
  if ((index + 1) % 100 === 0) {
    console.log(`Generated SQL for ${index + 1}/${ambassadors.length} ambassadors...`);
  }
});

sql += 'COMMIT;\n\n';

// Add verification query
sql += '-- Verification queries\n';
sql += 'SELECT COUNT(*) as total_ambassadors FROM ambassadors;\n';
sql += 'SELECT COUNT(*) as total_top_models FROM top_models;\n';
sql += 'SELECT COUNT(*) as ambassadors_with_models FROM (\n';
sql += '  SELECT DISTINCT ambassador_uuid FROM top_models\n';
sql += ');\n';

// Save to file
fs.writeFileSync('d1-migration.sql', sql);

console.log(`\n✅ Migration SQL generated!`);
console.log(`📄 File: d1-migration.sql`);
console.log(`📊 Size: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`\n📝 Next steps:`);
console.log(`1. Create D1 database: wrangler d1 create ambassador-yir-db`);
console.log(`2. Import schema: wrangler d1 execute ambassador-yir-db --file=d1-schema.sql`);
console.log(`3. Import data: wrangler d1 execute ambassador-yir-db --file=d1-migration.sql`);
