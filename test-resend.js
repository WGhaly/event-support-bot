// Test script to verify Resend email sending
require('dotenv').config({ path: '.env' })
const { Resend } = require('resend')

async function testResend() {
  console.log('=== Testing Resend Configuration ===\n')
  
  // Check environment variables
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  
  console.log('1. Environment Variables:')
  console.log('   RESEND_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET')
  console.log('   RESEND_FROM_EMAIL:', fromEmail)
  console.log()
  
  if (!apiKey) {
    console.error('❌ ERROR: RESEND_API_KEY is not set!')
    console.log('\nTo fix:')
    console.log('1. Sign up at https://resend.com')
    console.log('2. Get your API key from the dashboard')
    console.log('3. Add to .env file: RESEND_API_KEY=re_your_key_here')
    return
  }
  
  // Test API key format
  console.log('2. API Key Format:')
  if (apiKey.startsWith('re_')) {
    console.log('   ✅ API key format looks correct (starts with re_)')
  } else {
    console.log('   ⚠️  WARNING: API key should start with "re_"')
  }
  console.log()
  
  // Try to send a test email
  console.log('3. Attempting to send test email...')
  const resend = new Resend(apiKey)
  
  try {
    console.log('3. Attempting to send test email...')
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: 'waseemghaly@gmail.com', // Your test email
      subject: 'Test Email from Event Support Bot',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify Resend configuration.</p>
        <p>If you receive this, your Resend setup is working correctly!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    })
    
    if (error) {
      console.log('   ❌ Resend API returned error:', error)
      throw error
    }
    
    console.log('   ✅ SUCCESS! Email sent successfully')
    console.log('   Email ID:', data?.id || 'No ID returned')
    console.log('   Full response:', JSON.stringify(data, null, 2))
    console.log('   Email ID:', data.id)
    console.log()
    console.log('4. Check your inbox at waseemghaly@gmail.com')
    console.log('   (Also check spam folder)')
    console.log()
    console.log('=== Test Complete ===')
    
  } catch (error) {
    console.log('   ❌ FAILED to send email')
    console.log()
    console.log('4. Error Details:')
    console.log('   Message:', error.message)
    console.log('   Status:', error.statusCode)
    console.log('   Name:', error.name)
    console.log()
    
    if (error.message.includes('API key')) {
      console.log('💡 Possible fixes:')
      console.log('   - Verify your API key is correct in Resend dashboard')
      console.log('   - Make sure you copied the full key')
      console.log('   - Generate a new API key if needed')
    } else if (error.message.includes('domain')) {
      console.log('💡 Possible fixes:')
      console.log('   - Use "onboarding@resend.dev" for testing (no verification needed)')
      console.log('   - Or verify your domain in Resend dashboard for production')
    }
    console.log()
    console.log('Full error:', error)
  }
}

testResend().catch(console.error)
