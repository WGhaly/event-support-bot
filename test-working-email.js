require('dotenv').config()
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function testWithCorrectEmail() {
  console.log('=== Testing with YOUR email address ===\n')
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  
  console.log('Configuration:')
  console.log('  FROM:', fromEmail)
  console.log('  TO: waseem.ghaly@progressiosolutions.com (your verified email)')
  console.log()
  
  try {
    console.log('Sending test email...')
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: 'waseem.ghaly@progressiosolutions.com', // YOUR email
      subject: '✅ Event Support Bot - Email Test SUCCESS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">✅ Email System Working!</h1>
          <p>This email confirms that your Resend integration is working correctly.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>What This Means:</h2>
            <ul>
              <li>✅ Resend API key is valid</li>
              <li>✅ Email sending code is correct</li>
              <li>✅ Configuration is properly set up</li>
            </ul>
          </div>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #f59e0b; margin-top: 0;">⚠️ Important - Sandbox Mode</h3>
            <p>Your Resend account is in sandbox mode. To send emails to OTHER users (not just you):</p>
            <ol>
              <li>Go to <a href="https://resend.com/domains">resend.com/domains</a></li>
              <li>Add and verify your domain</li>
              <li>Update RESEND_FROM_EMAIL to use your domain</li>
            </ol>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280;">
            Sent at: ${new Date().toLocaleString()}<br>
            Test ID: ${Math.random().toString(36).substring(7)}
          </p>
        </div>
      `
    })
    
    if (error) {
      console.error('❌ Error:', error)
      process.exit(1)
    }
    
    console.log('\n✅ SUCCESS!')
    console.log('Email ID:', data?.id)
    console.log('\n📧 Check your inbox at: waseem.ghaly@progressiosolutions.com')
    console.log('   (Also check spam folder)\n')
    
  } catch (error) {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  }
}

testWithCorrectEmail()
