const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all console messages
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
  });

  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('zip')) {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });

  // Capture network responses
  page.on('response', async response => {
    if (response.url().includes('zip')) {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      const contentType = response.headers()['content-type'];
      console.log(`[RESPONSE] Content-Type: ${contentType}`);
    }
  });

  // Capture errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]:`, error.message);
  });

  // Go to login page
  console.log('\n=== Navigating to login page ===');
  await page.goto('https://thelujproject.vercel.app/auth/login');
  await page.waitForLoadState('networkidle');

  // Login
  console.log('\n=== Logging in ===');
  await page.fill('input[name="email"]', 'w@w.com');
  await page.fill('input[name="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('Login successful!');

  // Wait a bit for dashboard to load
  await page.waitForLoadState('networkidle');

  // Navigate to a project with exports
  console.log('\n=== Looking for project with exports ===');
  const projectLinks = await page.locator('a[href*="/dashboard/projects/"]').all();
  
  if (projectLinks.length > 0) {
    await projectLinks[0].click();
    await page.waitForLoadState('networkidle');
    console.log('Opened project');

    // Look for exports/view buttons
    const exportLinks = await page.locator('a[href*="/exports/"]').all();
    
    if (exportLinks.length > 0) {
      console.log(`Found ${exportLinks.length} export(s)`);
      await exportLinks[0].click();
      await page.waitForLoadState('networkidle');
      console.log('Opened export page');

      // Find the ZIP download button
      console.log('\n=== Looking for ZIP download button ===');
      const zipButton = page.locator('button:has-text("Download All as ZIP")');
      
      if (await zipButton.count() > 0) {
        console.log('Found ZIP download button');
        
        // Click the button and monitor network
        console.log('\n=== Clicking ZIP download button ===');
        await zipButton.click();
        
        // Wait and watch for 15 seconds
        console.log('Monitoring for 15 seconds...\n');
        await page.waitForTimeout(15000);
        
        console.log('\n=== Final page state ===');
        const buttonText = await zipButton.textContent();
        console.log('Button text:', buttonText);
        
        // Check if any error message appeared
        const errorMsg = await page.locator('text=/Error/i').first().textContent().catch(() => null);
        if (errorMsg) {
          console.log('Error message found:', errorMsg);
        }
      } else {
        console.log('ZIP download button not found');
      }
    } else {
      console.log('No exports found in project');
    }
  } else {
    console.log('No projects found');
  }

  console.log('\n=== Test complete - browser will stay open for 30 seconds ===');
  await page.waitForTimeout(30000);
  
  await browser.close();
})();
