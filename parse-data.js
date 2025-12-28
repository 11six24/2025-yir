const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('uppromote_top_affiliate_102736 (16).xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Total ambassadors:', data.length);
console.log('\nFirst record:');
console.log(JSON.stringify(data[0], null, 2));
console.log('\nAll column names:');
console.log(Object.keys(data[0]));
