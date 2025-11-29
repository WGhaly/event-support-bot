require('dotenv').config()
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function testSendEmail() {
  console.log('=== Testing Email Send with Full Debug ===\n')
  
  console.log('Environment Check:')
  console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT SET')
  console.log('  RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'NOT SET')
  console.log()
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const toEmail = 'waseem.ghaly@progressiosolutions.com' // Your verified email
  
  console.log('Email Configuration:')
  console.log('  FROM:', fromEmail)
  console.log('  TO:', toEmail)
  console.log()
  
  try {
    console.log('Attempting to send email...')
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Test Email from Event Support Bot',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Test Email</h1>
          <p>This is a test email to verify the email sending functionality.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `
    })
    
    if (error) {
      console.error('\n❌ RESEND API ERROR:')
      console.error('  Status Code:', error.statusCode)
      console.error('  Error Name:', error.name)
      console.error('  Error Message:', error.message)
      console.error('\n  Full Error Object:', JSON.stringify(error, null, 2))
      process.exit(1)
    }
    
    console.log('\n✅ SUCCESS!')
    console.log('  Email ID:', data?.id)
    console.log('  Response Data:', JSON.stringify(data, null, 2))
    console.log('\n📧 Check inbox at:', toEmail)
    
  } catch (error) {
    console.error('\n❌ EXCEPTION CAUGHT:')
    console.error('  Error Type:', error.constructor.name)
    console.error('  Error Message:', error.message)
    console.error('  Stack Trace:', error.stack)
    process.exit(1)
  }
}

testSendEmail()
