require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailWithQR() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luuj.cloud';
  const testRegistrationId = 'test-' + Date.now();
  const qrCodeUrl = `${baseUrl}/api/qr-code?registrationId=${testRegistrationId}`;
  
  console.log('🔍 Testing email with QR code...\n');
  console.log('Base URL:', baseUrl);
  console.log('QR Code URL:', qrCodeUrl);
  console.log('');
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test Email</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif;">
  <h1>Test Email with QR Code</h1>
  <p>Testing QR code image display in email:</p>
  <div style="text-align: center; margin: 30px 0;">
    <div style="display: inline-block; padding: 20px; background-color: #ffffff; border: 2px solid #e0e0e0; border-radius: 8px;">
      <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px; display: block;" />
    </div>
  </div>
  <p>QR Code URL: <a href="${qrCodeUrl}">${qrCodeUrl}</a></p>
  <p>If you see this image, the QR code is working!</p>
</body>
</html>
  `;
  
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL.trim(),
      to: 'waseemghaly@gmail.com',
      subject: 'Test Email with QR Code',
      html: htmlContent,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Email ID:', result.data.id);
    console.log('\n📧 Check your inbox at: waseemghaly@gmail.com');
    console.log('🔗 QR Code URL:', qrCodeUrl);
    console.log('\nℹ️  Click the QR Code URL to verify it loads as an image');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmailWithQR();
