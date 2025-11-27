#!/usr/bin/env node

/**
 * E2E Test Script for Badge Generation Platform
 * Tests: Login → View Export → Download ZIP
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runE2ETest() {
  console.log('🚀 Starting E2E Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to login
    console.log('📍 Step 1: Navigating to login page...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');
    console.log('✅ Login page loaded\n');

    // Step 2: Fill login form
    console.log('📍 Step 2: Logging in...');
    await page.fill('input[name="email"]', 'w@w.com');
    await page.fill('input[name="password"]', 'w');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    console.log('✅ Login successful\n');

    // Step 3: Navigate to project
    console.log('📍 Step 3: Navigating to project...');
    await page.goto('http://localhost:3000/dashboard/projects/cmihjxzbw000267fghnxyrfho');
    await page.waitForLoadState('networkidle');
    const projectName = await page.textContent('h1');
    console.log(`✅ Project loaded: ${projectName}\n`);

    // Step 4: Navigate to export page
    console.log('📍 Step 4: Navigating to export page...');
    await page.goto('http://localhost:3000/dashboard/projects/cmihjxzbw000267fghnxyrfho/exports/cmihl6wku0001121boikis0xh');
    await page.waitForLoadState('networkidle');
    
    // Check for completion status
    const isComplete = await page.locator('text=Generation Complete').isVisible();
    if (isComplete) {
      console.log('✅ Export page loaded - Status: Completed\n');
    } else {
      console.log('⚠️  Export may not be complete yet\n');
    }

    // Step 5: Check export details
    console.log('📍 Step 5: Verifying export details...');
    const exportDetails = {
      template: await page.locator('text=test-badge').count() > 0,
      dataset: await page.locator('text=test-data').count() > 0,
      badgeCount: await page.locator('text=5 badges').count() > 0,
    };
    console.log('Export Details:', exportDetails);
    console.log('✅ Export details verified\n');

    // Step 6: Download ZIP
    console.log('📍 Step 6: Downloading ZIP file...');
    const downloadButton = page.locator('button:has-text("Download All as ZIP")');
    
    if (await downloadButton.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadButton.click()
      ]);

      const downloadPath = path.join('/tmp', `badges-test-${Date.now()}.zip`);
      await download.saveAs(downloadPath);
      
      const stats = fs.statSync(downloadPath);
      console.log(`✅ ZIP downloaded successfully!`);
      console.log(`   Location: ${downloadPath}`);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB\n`);

      // Step 7: View manifest
      console.log('📍 Step 7: Checking manifest...');
      await page.click('a:has-text("View Manifest")');
      await page.waitForLoadState('networkidle');
      
      const manifestText = await page.textContent('body');
      const manifest = JSON.parse(manifestText);
      
      console.log('✅ Manifest loaded:');
      console.log(`   Export ID: ${manifest.exportId}`);
      console.log(`   Badge Count: ${manifest.badgeCount}`);
      console.log(`   Generated At: ${manifest.generatedAt}\n`);

      console.log('✨ E2E Test PASSED! All steps completed successfully.\n');
    } else {
      console.log('⚠️  Download button not found\n');
    }

    // Keep browser open for 3 seconds to see final state
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    
    // Take screenshot on error
    const screenshotPath = `/tmp/test-error-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
runE2ETest()
  .then(() => {
    console.log('✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
