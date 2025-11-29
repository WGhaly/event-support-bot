require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function checkEmail() {
  try {
    console.log('🔍 Checking Resend email status...\n');
    
    // Send a test email
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL.trim(),
      to: 'waseemghaly@gmail.com',
      subject: 'Test Email from luuj.cloud',
      html: '<h1>Test Email</h1><p>This is a test to verify email delivery.</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Email ID:', result.data.id);
    console.log('\n📋 Check your email at: waseemghaly@gmail.com');
    console.log('💡 Also check your SPAM folder');
    console.log('\n🔗 To see email status in Resend dashboard:');
    console.log('   https://resend.com/emails/' + result.data.id);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkEmail();
