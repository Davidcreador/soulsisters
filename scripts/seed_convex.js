#!/usr/bin/env node
/**
 * Batch Seeding Script for Convex
 * Imports products from JSON file in batches of 50
 * With automatic retry logic for failed batches
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BATCH_SIZE = 50;
const CONVEX_URL = "https://adept-sparrow-663.convex.cloud";

// Read products from JSON
const productsPath = path.join(__dirname, '..', 'data', 'products_clean.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log(`📦 Loaded ${products.length} products from JSON`);
console.log(`📊 Batch size: ${BATCH_SIZE}`);
console.log(`🔢 Total batches: ${Math.ceil(products.length / BATCH_SIZE)}`);
console.log('');

// Split into batches
function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const batches = chunk(products, BATCH_SIZE);

// Track results
const results = {
  successful: 0,
  failed: 0,
  failedProducts: [],
  batchesCompleted: 0,
  batchesFailed: 0
};

async function seedBatch(batch, batchIndex) {
  console.log(`\n🚀 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} products)...`);
  
  try {
    // Call Convex mutation
    const response = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: 'products:seedBatch',
        args: { products: batch }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process results
    let batchSuccess = 0;
    let batchFailed = 0;
    
    for (const result of data) {
      if (result.success) {
        batchSuccess++;
        results.successful++;
      } else {
        batchFailed++;
        results.failed++;
        results.failedProducts.push({
          batchIndex: batchIndex + 1,
          name: result.name,
          error: result.error
        });
      }
    }
    
    results.batchesCompleted++;
    console.log(`   ✅ Success: ${batchSuccess}, ❌ Failed: ${batchFailed}`);
    
  } catch (error) {
    console.error(`   💥 Batch ${batchIndex + 1} failed completely:`, error.message);
    results.batchesFailed++;
    
    // Add all products from failed batch to retry list
    for (const product of batch) {
      results.failedProducts.push({
        batchIndex: batchIndex + 1,
        name: product.name,
        error: `Batch failed: ${error.message}`
      });
    }
  }
}

async function retryFailedProducts() {
  if (results.failedProducts.length === 0) {
    console.log('\n✨ No failed products to retry!');
    return;
  }
  
  console.log(`\n🔄 Retrying ${results.failedProducts.length} failed products...`);
  
  // Extract just the product data for retry
  const productsToRetry = results.failedProducts.map(fp => {
    return products.find(p => p.name === fp.name);
  }).filter(p => p !== undefined);
  
  // Clear previous failures
  results.failedProducts = [];
  const previousFailed = results.failed;
  results.failed = 0;
  
  // Retry in smaller batches of 10
  const retryBatches = chunk(productsToRetry, 10);
  
  for (let i = 0; i < retryBatches.length; i++) {
    console.log(`\n🔄 Retry batch ${i + 1}/${retryBatches.length}...`);
    await seedBatch(retryBatches[i], `retry-${i}`);
  }
  
  console.log(`\n📊 Retry Results:`);
  console.log(`   Previously failed: ${previousFailed}`);
  console.log(`   Still failing: ${results.failed}`);
  console.log(`   Recovered: ${previousFailed - results.failed}`);
}

async function main() {
  console.log('🎯 Starting batch import to Convex...\n');
  
  // Process all batches
  for (let i = 0; i < batches.length; i++) {
    await seedBatch(batches[i], i);
    
    // Small delay between batches to avoid rate limiting
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully imported: ${results.successful}/${products.length}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📦 Batches completed: ${results.batchesCompleted}/${batches.length}`);
  console.log(`💥 Batches failed: ${results.batchesFailed}`);
  
  // Retry failed products
  if (results.failed > 0) {
    await retryFailedProducts();
  }
  
  // Save permanently failed products
  if (results.failedProducts.length > 0) {
    const failedPath = path.join(__dirname, '..', 'data', 'failed_products.json');
    fs.writeFileSync(failedPath, JSON.stringify(results.failedProducts, null, 2));
    console.log(`\n⚠️  ${results.failedProducts.length} products permanently failed`);
    console.log(`   Saved to: ${failedPath}`);
    console.log('\n❌ Failed products:');
    for (const fp of results.failedProducts.slice(0, 5)) {
      console.log(`   - ${fp.name}: ${fp.error}`);
    }
    if (results.failedProducts.length > 5) {
      console.log(`   ... and ${results.failedProducts.length - 5} more`);
    }
  }
  
  console.log('\n✨ Import complete!');
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
