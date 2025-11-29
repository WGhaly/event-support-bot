require('dotenv').config();
const { Resend } = require('resend');
const QRCode = require('qrcode');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailContent() {
  console.log('🔍 Testing email content generation...\n');
  
  // Generate QR code as base64
  const testUrl = 'https://luuj.cloud/attendance/test123';
  const qrCodeDataUri = await QRCode.toDataURL(testUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 400,
    margin: 2,
  });
  
  console.log('QR Code Data URI length:', qrCodeDataUri.length);
  console.log('QR Code Data URI preview:', qrCodeDataUri.substring(0, 100) + '...\n');
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test Email</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif;">
  <h1>Test Email - Full Content</h1>
  <p>Hi John Doe,</p>
  <p>Your registration for <strong>Test Event</strong> has been accepted!</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <div style="display: inline-block; padding: 20px; background-color: #ffffff; border: 2px solid #e0e0e0; border-radius: 8px;">
      <img src="${qrCodeDataUri}" alt="QR Code" style="width: 200px; height: 200px; display: block;" />
    </div>
  </div>
  
  <p><strong>Event Details:</strong></p>
  <ul>
    <li>Date: December 1, 2025</li>
    <li>Location: Convention Center</li>
    <li>Registration ID: test123</li>
  </ul>
  
  <p>See you at the event!</p>
</body>
</html>
  `;
  
  console.log('HTML Content length:', htmlContent.length, 'characters\n');
  
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL.trim(),
      to: 'waseemghaly@gmail.com',
      subject: 'Test Email - Full Content Check',
      html: htmlContent,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Email ID:', result.data.id);
    console.log('\n📧 Check your inbox to verify content appears correctly');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmailContent();
