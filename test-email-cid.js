require('dotenv').config();
const QRCode = require('qrcode');
const { Resend } = require('resend');

async function testCIDEmail() {
  console.log('🔍 Testing CID attachment approach...\n');
  
  // Generate QR code as buffer
  const attendanceUrl = 'https://luuj.cloud/attendance/test-cid-123';
  const qrCodeBuffer = await QRCode.toBuffer(attendanceUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 400,
    margin: 2,
  });
  
  console.log('✅ QR Code buffer generated');
  console.log('   Buffer size:', qrCodeBuffer.length, 'bytes');
  console.log('');
  
  const qrCodeCid = 'qrcode@luuj.cloud';
  const qrCodeSrc = `cid:${qrCodeCid}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CID Test</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h1>QR Code via CID Attachment</h1>
  <p>This email uses a CID (Content-ID) attachment instead of base64.</p>
  <div style="margin: 20px 0; padding: 20px; border: 2px solid #ccc; text-align: center;">
    <img src="${qrCodeSrc}" alt="QR Code" style="width: 200px; height: 200px;" />
  </div>
  <p>The QR code should be visible in Gmail and other email clients.</p>
</body>
</html>
  `;
  
  console.log('✅ HTML created with CID reference');
  console.log('   CID:', qrCodeCid);
  console.log('   Image src:', qrCodeSrc);
  console.log('');
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL.trim(),
      to: 'waseemghaly@gmail.com',
      subject: 'Test: QR Code with CID Attachment',
      html: htmlContent,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          contentId: qrCodeCid,
        },
      ],
    });
    
    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', result.data.id);
    console.log('');
    console.log('📧 Check your inbox at: waseemghaly@gmail.com');
    console.log('');
    console.log('Expected result:');
    console.log('  - QR code should be VISIBLE (not broken)');
    console.log('  - No "display images" prompt needed');
    console.log('  - QR code should be scannable');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCIDEmail();
