require('dotenv').config()
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function testProductionEmail() {
  console.log('=== Testing Production Email Setup ===\n')
  
  const fromEmail = 'events@luuj.cloud'
  const testEmail = 'waseemghaly@gmail.com'
  
  console.log('Configuration:')
  console.log('  FROM:', fromEmail)
  console.log('  TO:', testEmail)
  console.log('  API Key:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT SET')
  console.log()
  
  try {
    console.log('Sending test email...')
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: '🎉 Test Email from luuj.cloud',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">🎉 Success!</h1>
          <p>This email was sent from <strong>events@luuj.cloud</strong></p>
          <p>If you're reading this, your custom domain email is working perfectly!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Sent at: ${new Date().toLocaleString()}<br>
            From: Event Support Bot (luuj.cloud)
          </p>
        </div>
      `
    })
    
    if (error) {
      console.log('\n❌ ERROR:')
      console.log('Message:', error.message)
      console.log('Status Code:', error.statusCode)
      console.log('Error Name:', error.name)
      console.log()
      
      if (error.statusCode === 422) {
        console.log('💡 This means the email format is invalid or domain is not verified in Resend.')
        console.log('   Check: https://resend.com/domains')
        console.log('   Make sure luuj.cloud shows as "Verified"')
      }
      
      if (error.message.includes('can only send testing emails')) {
        console.log('💡 Your domain is not verified yet in Resend.')
        console.log('   Go to: https://resend.com/domains')
        console.log('   Wait for DNS propagation (can take 5-30 minutes)')
      }
      
      return
    }
    
    console.log('\n✅ SUCCESS!')
    console.log('Email ID:', data?.id)
    console.log()
    console.log('📧 Check your inbox at:', testEmail)
    console.log('   (Also check spam folder)')
    console.log()
    console.log('🎊 Your email system is fully operational!')
    
  } catch (error) {
    console.log('\n❌ EXCEPTION:', error.message)
  }
}

testProductionEmail()
