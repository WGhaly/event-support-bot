// Test badge generation locally to verify the font fix works
const fetch = require('node-fetch');
const fs = require('fs');

async function testBadgeGeneration() {
  console.log('Testing local badge generation...\n');
  
  // First, we need to login to get a session
  console.log('Step 1: Logging in...');
  const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'w@w.com',
      password: '12345678',
    }),
  });
  
  const cookies = loginResponse.headers.raw()['set-cookie'];
  console.log('Login response status:', loginResponse.status);
  console.log('Cookies:', cookies ? 'Received' : 'None');
  
  if (!cookies) {
    console.error('Failed to get session cookie');
    return;
  }
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Now generate badges
  console.log('\nStep 2: Generating badges...');
  const generateResponse = await fetch('http://localhost:3000/api/exports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies.join('; '),
    },
    body: JSON.stringify({
      fieldMappingId: 'cmihzy6v70005z5lys43l8ak3',
    }),
  });
  
  const result = await generateResponse.json();
  console.log('Generation response:', JSON.stringify(result, null, 2));
  
  if (result.success && result.data && result.data.id) {
    console.log('\nStep 3: Waiting for badge generation to complete...');
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    // Get the export details
    console.log('\nStep 4: Fetching export details...');
    const exportResponse = await fetch(`http://localhost:3000/api/exports/${result.data.id}`, {
      headers: {
        'Cookie': cookies.join('; '),
      },
    });
    
    const exportData = await exportResponse.json();
    console.log('Export data:', JSON.stringify(exportData, null, 2));
    
    if (exportData.success && exportData.data.manifestUrl) {
      console.log('\nStep 5: Fetching manifest...');
      const manifestResponse = await fetch(exportData.data.manifestUrl);
      const manifest = await manifestResponse.json();
      console.log('Manifest:', JSON.stringify(manifest, null, 2));
      
      if (manifest.badges && manifest.badges.length > 0) {
        console.log('\nStep 6: Downloading first badge...');
        const badgeUrl = manifest.badges[0];
        const badgeResponse = await fetch(badgeUrl);
        const buffer = await badgeResponse.buffer();
        
        const filename = 'test-badge-local-fixed.png';
        fs.writeFileSync(filename, buffer);
        console.log(`Badge saved to: ${filename}`);
        console.log(`File size: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(1)} KB)`);
        
        // Run OCR
        console.log('\nStep 7: Running OCR to check for text...');
        const { exec } = require('child_process');
        exec(`tesseract ${filename} - 2>/dev/null`, (error, stdout, stderr) => {
          console.log('OCR Result:');
          console.log(stdout || '(no text detected)');
          
          if (stdout && stdout.includes('John Doe')) {
            console.log('\n✅ SUCCESS! Badge contains data!');
          } else {
            console.log('\n❌ FAILED: Badge still has no data');
          }
        });
      }
    }
  } else {
    console.error('Badge generation failed or returned no ID');
  }
}

testBadgeGeneration().catch(console.error);
