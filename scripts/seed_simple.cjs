#!/usr/bin/env node
/**
 * Simple Seeding Script using Convex CLI
 * Imports products from JSON file
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'data', 'products_clean.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log(`📦 Importing ${products.length} products to Convex...\n`);

// Import one by one for better error handling
let success = 0;
let failed = 0;
const failedProducts = [];

async function importProducts() {
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    process.stdout.write(`[${i + 1}/${products.length}] ${product.name.substring(0, 40)}... `);
    
    try {
      // Remove dateAdded as it's set automatically by Convex
      const { dateAdded, ...productData } = product;
      
      // Use convex CLI to insert
      const result = execSync(
        `npx convex run products:add '${JSON.stringify(productData)}' --prod`,
        { 
          encoding: 'utf-8', 
          stdio: 'pipe',
          cwd: path.join(__dirname, '..')
        }
      );
      
      success++;
      console.log('✅');
      
      // Small delay to avoid overwhelming the API
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
    } catch (error) {
      failed++;
      const errorMsg = error.stderr || error.message || 'Unknown error';
      failedProducts.push({ name: product.name, error: errorMsg.substring(0, 100) });
      console.log('❌');
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully imported: ${success}/${products.length}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failedProducts.length > 0) {
    console.log('\n⚠️  Failed products:');
    for (const fp of failedProducts.slice(0, 10)) {
      console.log(`   - ${fp.name}: ${fp.error}`);
    }
    if (failedProducts.length > 10) {
      console.log(`   ... and ${failedProducts.length - 10} more`);
    }
    
    // Save failed products
    const failedPath = path.join(__dirname, '..', 'data', 'failed_products.json');
    fs.writeFileSync(failedPath, JSON.stringify(failedProducts, null, 2));
    console.log(`\n💾 Saved failed products to: ${failedPath}`);
  }
  
  console.log('\n✨ Import complete!');
}

importProducts().catch(console.error);
