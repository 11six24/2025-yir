const fs = require('fs');

console.log('🎯 Adding top models to ambassador data...\n');

// Load order products data
if (!fs.existsSync('order-products.json')) {
  console.error('❌ order-products.json not found!');
  console.error('Run fetch-shopify-products.js first to fetch order data from Shopify.');
  process.exit(1);
}

const orderProducts = JSON.parse(fs.readFileSync('order-products.json', 'utf8'));
const ambassadorData = JSON.parse(fs.readFileSync('ambassador-data.json', 'utf8'));
const emailLookup = JSON.parse(fs.readFileSync('email-lookup.json', 'utf8'));

// Load product image cache if it exists
let imageCache = {};
if (fs.existsSync('product-image-cache.json')) {
  imageCache = JSON.parse(fs.readFileSync('product-image-cache.json', 'utf8'));
  console.log(`Loaded ${Object.keys(imageCache).length} product images from cache`);
} else {
  console.log('⚠️  No product image cache found. Run fetch-product-images.js to add images.');
}

console.log(`Loaded ${Object.keys(orderProducts).length} orders`);
console.log(`Loaded ${Object.keys(ambassadorData).length} ambassadors\n`);

// Build product map for each ambassador
const ambassadorProducts = {};

Object.values(orderProducts).forEach(order => {
  order.emails.forEach(email => {
    const normalizedEmail = email.toLowerCase().trim();

    if (!ambassadorProducts[normalizedEmail]) {
      ambassadorProducts[normalizedEmail] = [];
    }

    // Add all products from this order
    order.products.forEach(product => {
      for (let i = 0; i < product.quantity; i++) {
        ambassadorProducts[normalizedEmail].push({
          title: product.title,
          variant: product.variantTitle,
          fullName: product.variantTitle
            ? `${product.title} - ${product.variantTitle}`
            : product.title,
        });
      }
    });
  });
});

console.log(`Found products for ${Object.keys(ambassadorProducts).length} ambassadors\n`);

// Calculate top 3 models for each ambassador
let updatedCount = 0;
let noProductsCount = 0;

Object.entries(ambassadorProducts).forEach(([email, products]) => {
  const uuid = emailLookup[email];

  if (!uuid || !ambassadorData[uuid]) {
    return;
  }

  // Count occurrences of each product
  const productCounts = {};

  products.forEach(p => {
    const key = p.fullName;
    productCounts[key] = (productCounts[key] || 0) + 1;
  });

  // Sort by count and get top 3
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      count,
      image: imageCache[name] || null, // Use cached image
    }));

  // Update ambassador data
  if (topProducts.length > 0) {
    ambassadorData[uuid].topModels = topProducts;
    updatedCount++;
  } else {
    noProductsCount++;
  }
});

console.log(`✅ Updated ${updatedCount} ambassadors with top models`);
console.log(`⚠️  ${noProductsCount} ambassadors have no product data\n`);

// Show some examples
console.log('📊 Sample results:\n');

const samples = Object.entries(ambassadorData)
  .filter(([_, data]) => data.topModels && data.topModels.length > 0)
  .slice(0, 5);

samples.forEach(([uuid, data]) => {
  console.log(`${data.name}:`);
  data.topModels.forEach((model, i) => {
    console.log(`  ${i + 1}. ${model.name} (${model.count} orders)`);
  });
  console.log('');
});

// Save updated data
fs.writeFileSync('ambassador-data.json', JSON.stringify(ambassadorData, null, 2));

// Also update the public version for the website
fs.writeFileSync(
  'ambassador-yir/public/ambassador-data.json',
  JSON.stringify(ambassadorData, null, 2)
);

console.log('💾 Saved updated ambassador data');
console.log('✅ Done! Top models have been added to the Year in Review data.\n');

// Statistics
const withModels = Object.values(ambassadorData).filter(a => a.topModels).length;
const totalAmbassadors = Object.keys(ambassadorData).length;

console.log('📈 Statistics:');
console.log(`Total ambassadors: ${totalAmbassadors}`);
console.log(`With top models: ${withModels}`);
console.log(`Percentage: ${Math.round((withModels / totalAmbassadors) * 100)}%`);
