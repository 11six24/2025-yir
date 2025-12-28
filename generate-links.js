const fs = require('fs');

// Read the email lookup data
const emailLookup = JSON.parse(fs.readFileSync('email-lookup.json', 'utf8'));
const ambassadorData = JSON.parse(fs.readFileSync('ambassador-data.json', 'utf8'));

// Generate CSV with name, email, and unique link
const baseUrl = 'https://your-domain.pages.dev'; // Replace with your actual domain

let csv = 'Name,Email,Unique Link\n';

Object.entries(emailLookup).forEach(([email, uuid]) => {
  const data = ambassadorData[uuid];
  const link = `${baseUrl}/${uuid}`;
  csv += `"${data.name}","${email}","${link}"\n`;
});

fs.writeFileSync('ambassador-links.csv', csv);

console.log(`✅ Generated links for ${Object.keys(emailLookup).length} ambassadors`);
console.log(`📧 Links saved to ambassador-links.csv`);
console.log(`\n📝 Sample links:`);

// Show first 5 as samples
Object.entries(emailLookup).slice(0, 5).forEach(([email, uuid]) => {
  const data = ambassadorData[uuid];
  console.log(`${data.name}: ${baseUrl}/${uuid}`);
});
