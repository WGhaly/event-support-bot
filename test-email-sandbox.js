require('dotenv').config()
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function testEmailWithMultipleRecipients() {
  console.log('=== Testing Email with Different Recipients ===\n')
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  
  console.log('Configuration:')
  console.log('  FROM:', fromEmail)
  console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT SET')
  console.log()
  
  // Test recipients
  const testRecipients = [
    { email: 'waseem.ghaly@progressiosolutions.com', description: 'Your verified email (SHOULD WORK)' },
    { email: 'waseemghaly@gmail.com', description: 'Different email (WILL FAIL in sandbox)' },
  ]
  
  for (const recipient of testRecipients) {
    console.log(`\n--- Testing: ${recipient.description} ---`)
    console.log(`TO: ${recipient.email}`)
    
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipient.email,
        subject: `Test Email to ${recipient.email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Test Email</h1>
            <p>Testing email delivery to: ${recipient.email}</p>
            <p>Time: ${new Date().toLocaleString()}</p>
          </div>
        `
      })
      
      if (error) {
        console.log('❌ FAILED')
        console.log('Error:', error.message)
        console.log('Status Code:', error.statusCode)
        console.log('Error Name:', error.name)
        
        if (error.message.includes('can only send testing emails')) {
          console.log('\n💡 SOLUTION: This email is blocked by Resend sandbox mode.')
          console.log('   To send to this address, verify a domain at: https://resend.com/domains')
        }
      } else {
        console.log('✅ SUCCESS')
        console.log('Email ID:', data?.id)
      }
      
    } catch (error) {
      console.log('❌ EXCEPTION:', error.message)
    }
    
    // Small delay between sends
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('\n=== Summary ===')
  console.log('✅ Emails to waseem.ghaly@progressiosolutions.com will work')
  console.log('❌ Emails to other addresses will fail (sandbox mode)')
  console.log('\n💡 To fix: Verify a domain at https://resend.com/domains')
}

testEmailWithMultipleRecipients()
