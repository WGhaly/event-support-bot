import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Complete Badge Generation Workflow', () => {
  test.setTimeout(180000); // 3 minutes timeout for complete workflow
  
  const timestamp = Date.now();
  const testEmail = `test-${timestamp}@example.com`;
  const testPassword = 'Test123456!';
  
  test('should complete full workflow: signup -> create project -> upload template -> define fields -> import data -> map fields -> generate badges -> download', async ({ page }) => {
    // Step 1: Sign Up
    console.log('Step 1: Navigating to signup...');
    await page.goto('http://localhost:3002/signup');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    console.log('Step 1: Waiting for redirect to signin...');
    await page.waitForURL('**/signin*', { timeout: 10000 });
    await expect(page).toHaveURL(/signin/);
    
    // Step 2: Sign In
    console.log('Step 2: Signing in...');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    console.log('Step 2: Waiting for redirect to dashboard...');
    await page.waitForURL('**/dashboard*', { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
    
    // Step 3: Create Project
    console.log('Step 3: Creating project...');
    await page.click('text="New Project"');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="name"]', `E2E Test Project ${timestamp}`);
    await page.fill('textarea[name="description"]', 'Automated test project');
    await page.click('button[type="submit"]:has-text("Create")');
    
    console.log('Step 3: Waiting for project page...');
    await page.waitForURL('**/projects/**', { timeout: 10000 });
    const projectUrl = page.url();
    const projectId = projectUrl.split('/projects/')[1]?.split('/')[0];
    console.log('Created project:', projectId);
    
    // Step 4: Upload Template
    console.log('Step 4: Uploading template...');
    await page.click('text="Upload Template"');
    await page.waitForLoadState('networkidle');
    
    const templatePath = path.join(__dirname, 'fixtures', 'test-badge.png');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(templatePath);
    
    await page.fill('input[name="name"]', 'Test Badge Template');
    await page.click('button[type="submit"]:has-text("Upload")');
    
    console.log('Step 4: Waiting for template page...');
    await page.waitForURL('**/templates/**', { timeout: 15000 });
    const templateUrl = page.url();
    const templateId = templateUrl.split('/templates/')[1]?.split('/')[0];
    console.log('Created template:', templateId);
    
    // Step 5: Define Fields in Visual Editor
    console.log('Step 5: Opening visual editor...');
    await page.click('text="Edit Fields"');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for Konva canvas to load
    
    // Add a text field
    console.log('Step 5: Adding text field...');
    await page.click('button:has-text("Add Text Field")');
    await page.waitForTimeout(1000);
    
    // Fill field properties
    await page.fill('input[placeholder="Field Name"]', 'Name');
    await page.fill('input[placeholder="Sample Text"]', 'John Doe');
    await page.waitForTimeout(2000); // Wait for auto-save
    
    console.log('Step 5: Fields saved, going back...');
    await page.click('text="Back to Template"');
    await page.waitForLoadState('networkidle');
    
    // Step 6: Import Dataset
    console.log('Step 6: Navigating back to project...');
    await page.goto(`http://localhost:3002/dashboard/projects/${projectId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('Step 6: Importing dataset...');
    await page.click('text="Import Dataset"');
    await page.waitForLoadState('networkidle');
    
    const csvPath = path.join(__dirname, 'fixtures', 'test-data.csv');
    const csvInput = page.locator('input[type="file"]');
    await csvInput.setInputFiles(csvPath);
    
    await page.fill('input[name="name"]', 'Test Attendees');
    await page.click('button[type="submit"]:has-text("Import")');
    
    console.log('Step 6: Waiting for dataset page...');
    await page.waitForURL('**/datasets/**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Step 7: Create Field Mapping
    console.log('Step 7: Going back to template for mapping...');
    await page.goto(`http://localhost:3002/dashboard/projects/${projectId}/templates/${templateId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('Step 7: Creating field mapping...');
    await page.click('text="Map Fields"');
    await page.waitForLoadState('networkidle');
    
    // Select dataset
    const datasetSelect = page.locator('select').first();
    await datasetSelect.selectOption({ index: 1 }); // Select first dataset
    await page.waitForTimeout(2000);
    
    // Map the Name field
    console.log('Step 7: Mapping Name field...');
    const nameMapping = page.locator('select[name="Name"]');
    if (await nameMapping.count() > 0) {
      await nameMapping.selectOption({ index: 1 }); // Select first column
    }
    
    await page.fill('input[name="mappingName"]', 'Test Mapping');
    await page.click('button[type="submit"]:has-text("Save Mapping")');
    
    console.log('Step 7: Waiting for mapping page...');
    await page.waitForURL('**/field-mappings/**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Step 8: Generate Badges (small batch for testing)
    console.log('Step 8: Generating badges...');
    await page.click('text="Generate Badges"');
    await page.waitForLoadState('networkidle');
    
    // Generate only 5 badges for testing speed
    await page.fill('input[name="badgeCount"]', '5');
    await page.click('button[type="submit"]:has-text("Start Generation")');
    
    console.log('Step 8: Waiting for generation to complete...');
    await page.waitForURL('**/exports/**', { timeout: 60000 }); // Wait up to 1 minute for generation
    await page.waitForLoadState('networkidle');
    
    // Wait for "completed" status
    await page.waitForSelector('text=/Status.*completed/i', { timeout: 60000 });
    console.log('Step 8: Badge generation completed!');
    
    // Step 9: Verify badges generated
    console.log('Step 9: Verifying badges...');
    const badgeImages = page.locator('img[alt*="badge"]');
    const badgeCount = await badgeImages.count();
    expect(badgeCount).toBeGreaterThan(0);
    console.log(`Found ${badgeCount} badge images`);
    
    // Step 10: Download ZIP
    console.log('Step 10: Downloading ZIP...');
    const downloadButton = page.locator('button:has-text("Download All as ZIP")');
    if (await downloadButton.count() > 0) {
      await downloadButton.click();
      await page.waitForTimeout(10000); // Wait for ZIP creation
      console.log('ZIP download initiated');
    }
    
    console.log('✅ Complete workflow test passed!');
  });
});
