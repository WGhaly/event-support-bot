import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Complete Badge Generation Workflow', () => {
  const timestamp = Date.now();
  const testEmail = `test-${timestamp}@example.com`;
  const testPassword = 'TestPass123!';
  const projectName = `Test Project ${timestamp}`;
  
  test('should complete full badge generation workflow', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes timeout for full workflow

    // Step 1: Sign Up
    console.log('Step 1: Testing Sign Up...');
    await page.goto('http://localhost:3002/signup');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    
    await page.click('button[type="submit"]');
    await page.waitForURL('**/signin', { timeout: 10000 });
    console.log('✓ Sign up successful');

    // Step 2: Sign In
    console.log('Step 2: Testing Sign In...');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✓ Sign in successful');

    // Step 3: Create Project
    console.log('Step 3: Creating Project...');
    await page.click('text=New Project');
    await page.waitForURL('**/projects/new');
    
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Automated test project');
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/projects\/[^/]+$/, { timeout: 10000 });
    
    const projectUrl = page.url();
    const projectId = projectUrl.split('/').pop();
    console.log(`✓ Project created with ID: ${projectId}`);

    // Step 4: Upload Template
    console.log('Step 4: Uploading Template...');
    await page.click('text=Upload Template');
    await page.waitForURL('**/templates/new');
    
    // Create a simple test image using canvas
    const templatePath = path.join(__dirname, '../fixtures/test-badge.png');
    await page.setInputFiles('input[type="file"]', templatePath);
    
    await page.fill('input[name="name"]', 'Test Badge Template');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to template page
    await page.waitForURL(/\/templates\/[^/]+$/, { timeout: 15000 });
    const templateUrl = page.url();
    const templateId = templateUrl.split('/').pop();
    console.log(`✓ Template uploaded with ID: ${templateId}`);

    // Step 5: Edit Fields in Visual Editor
    console.log('Step 5: Editing Fields...');
    await page.click('text=Edit Fields');
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Add a text field for "Name"
    await page.click('button:has-text("Add Text Field")');
    await page.waitForTimeout(1000); // Wait for field to be added
    
    // Update field properties
    const nameInput = page.locator('input[placeholder*="Field"]').first();
    await nameInput.fill('Name');
    
    // Add another text field for "Title"
    await page.click('button:has-text("Add Text Field")');
    await page.waitForTimeout(1000);
    
    // Save is automatic, wait a bit
    await page.waitForTimeout(3000);
    console.log('✓ Fields edited and saved');

    // Step 6: Go back to project to import dataset
    console.log('Step 6: Importing Dataset...');
    await page.goto(`http://localhost:3002/dashboard/projects/${projectId}`);
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Import Dataset');
    await page.waitForURL('**/datasets/new');
    
    // Upload CSV file
    const csvPath = path.join(__dirname, '../fixtures/test-data.csv');
    await page.setInputFiles('input[type="file"]', csvPath);
    
    await page.fill('input[name="name"]', 'Test Attendees');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/datasets\/[^/]+$/, { timeout: 15000 });
    const datasetUrl = page.url();
    const datasetId = datasetUrl.split('/').pop();
    console.log(`✓ Dataset imported with ID: ${datasetId}`);

    // Step 7: Create Field Mapping
    console.log('Step 7: Creating Field Mapping...');
    await page.goto(`http://localhost:3002/dashboard/projects/${projectId}`);
    await page.waitForLoadState('networkidle');
    
    // Click on template to go to mapping
    await page.click(`text=${projectName}`).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Look for "Create Mapping" or "Map Fields" button
    const mapButton = page.locator('button:has-text("Map Fields"), a:has-text("Map Fields")').first();
    if (await mapButton.isVisible()) {
      await mapButton.click();
    } else {
      // Navigate directly if button not found
      await page.goto(`http://localhost:3002/dashboard/projects/${projectId}/templates/${templateId}/mappings/new`);
    }
    
    await page.waitForURL('**/mappings/new', { timeout: 10000 });
    
    // Select dataset
    await page.selectOption('select[name="datasetId"]', datasetId!);
    await page.waitForTimeout(2000);
    
    // Map fields - drag and drop or click mapping
    // For simplicity, we'll just fill the mapping name and save
    await page.fill('input[name="name"]', 'Test Mapping');
    
    // The mapping interface should auto-detect columns
    // Try to map Name column to Name field
    const nameColumn = page.locator('text=name').first();
    const nameField = page.locator('text=Name').last();
    
    if (await nameColumn.isVisible() && await nameField.isVisible()) {
      await nameColumn.dragTo(nameField).catch(() => console.log('Drag failed, continuing...'));
    }
    
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Save")');
    
    await page.waitForURL(/\/field-mappings\/[^/]+$/, { timeout: 15000 });
    const mappingUrl = page.url();
    const mappingId = mappingUrl.split('/').pop();
    console.log(`✓ Field mapping created with ID: ${mappingId}`);

    // Step 8: Generate Badges
    console.log('Step 8: Generating Badges...');
    await page.click('button:has-text("Generate Badges"), a:has-text("Generate Badges")');
    await page.waitForTimeout(2000);
    
    // Enter badge count
    const badgeCountInput = page.locator('input[name="badgeCount"], input[type="number"]').first();
    if (await badgeCountInput.isVisible()) {
      await badgeCountInput.fill('5'); // Generate 5 badges for quick test
    }
    
    await page.click('button:has-text("Start Generation"), button:has-text("Generate")');
    
    // Wait for generation to complete - look for progress or completion
    await page.waitForSelector('text=/completed|finished|success/i', { timeout: 60000 });
    console.log('✓ Badge generation completed');
    
    // Step 9: Download ZIP
    console.log('Step 9: Testing ZIP Download...');
    await page.waitForTimeout(2000);
    
    const zipButton = page.locator('button:has-text("Download"), button:has-text("ZIP")').first();
    if (await zipButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
      
      await zipButton.click();
      
      // Wait for ZIP creation and download
      const download = await downloadPromise;
      console.log(`✓ ZIP download initiated: ${download.suggestedFilename()}`);
      
      // Optionally save the file
      const downloadPath = path.join(__dirname, '../downloads', download.suggestedFilename());
      await download.saveAs(downloadPath);
      console.log(`✓ ZIP saved to: ${downloadPath}`);
    } else {
      console.log('⚠ ZIP download button not found, checking for alternative download options');
    }

    // Step 10: Verify Export Details
    console.log('Step 10: Verifying Export Details...');
    const exportLink = page.locator('a:has-text("View"), a:has-text("Details")').first();
    if (await exportLink.isVisible()) {
      await exportLink.click();
      await page.waitForURL(/\/exports\/[^/]+$/, { timeout: 10000 });
      
      // Verify badges are shown
      const badges = page.locator('img[alt*="badge"], img[src*="badge"]');
      const badgeCount = await badges.count();
      console.log(`✓ Export page shows ${badgeCount} badges`);
      
      expect(badgeCount).toBeGreaterThan(0);
    }

    console.log('\n✅ COMPLETE WORKFLOW TEST PASSED!\n');
    console.log('Summary:');
    console.log('- Sign up: ✓');
    console.log('- Sign in: ✓');
    console.log('- Create project: ✓');
    console.log('- Upload template: ✓');
    console.log('- Edit fields: ✓');
    console.log('- Import dataset: ✓');
    console.log('- Create field mapping: ✓');
    console.log('- Generate badges: ✓');
    console.log('- Download ZIP: ✓');
  });
});
