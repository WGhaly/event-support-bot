const fetch = require('node-fetch')

async function testProductionAPI() {
  console.log('=== Testing Production Email API ===\n')
  
  const baseUrl = 'https://luuj.cloud'
  
  // First, let's try to get the API response
  console.log('1. Testing email template API endpoint...')
  
  try {
    const response = await fetch(`${baseUrl}/api/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'waseemghaly@gmail.com',
        subject: 'Test from Production',
      })
    })
    
    console.log('Status:', response.status)
    const text = await response.text()
    console.log('Response:', text)
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testProductionAPI()
