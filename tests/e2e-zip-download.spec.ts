import { test, expect } from '@playwright/test';

test.describe('E2E Badge Generation and ZIP Download', () => {
  test('complete workflow from login to ZIP download', async ({ page }) => {
    // Step 1: Navigate to login page
    await page.goto('http://localhost:3000/signin');
    await expect(page).toHaveTitle(/Sign In/);

    // Step 2: Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**');
    await expect(page.locator('text=Projects')).toBeVisible();

    // Step 3: Navigate to existing project
    await page.goto('http://localhost:3000/dashboard/projects/cmihjxzbw000267fghnxyrfho');
    await expect(page.locator('h1')).toContainText('test 1');

    // Step 4: Navigate to export page
    await page.goto('http://localhost:3000/dashboard/projects/cmihjxzbw000267fghnxyrfho/exports/cmihl6wku0001121boikis0xh');
    
    // Verify export page loaded
    await expect(page.locator('h1')).toContainText('Badge Generation');
    await expect(page.locator('text=Generation Complete')).toBeVisible();

    // Step 5: Click Download All as ZIP button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download All as ZIP")');

    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download filename
    expect(download.suggestedFilename()).toContain('.zip');
    
    // Save the download
    const downloadPath = `/tmp/test-badges-${Date.now()}.zip`;
    await download.saveAs(downloadPath);
    
    console.log(`✅ ZIP downloaded successfully to: ${downloadPath}`);
    
    // Step 6: Verify manifest is visible
    await page.click('a:has-text("View Manifest")');
    await page.waitForURL('**/manifest.json');
    
    // Verify manifest content
    const manifestText = await page.textContent('body');
    const manifest = JSON.parse(manifestText || '{}');
    
    expect(manifest.badgeCount).toBe(5);
    expect(manifest.badges).toHaveLength(5);
    
    console.log('✅ E2E Test completed successfully!');
  });

  test('verify all export details', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    // Navigate to export
    await page.goto('http://localhost:3000/dashboard/projects/cmihjxzbw000267fghnxyrfho/exports/cmihl6wku0001121boikis0xh');

    // Verify export details
    await expect(page.locator('text=Template')).toBeVisible();
    await expect(page.locator('text=test-badge')).toBeVisible();
    await expect(page.locator('text=Dataset')).toBeVisible();
    await expect(page.locator('text=test-data')).toBeVisible();
    await expect(page.locator('text=5 badges')).toBeVisible();

    // Verify status
    await expect(page.locator('text=Completed')).toBeVisible();
    
    console.log('✅ Export details verified!');
  });
});
