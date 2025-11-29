require('dotenv').config();
const QRCode = require('qrcode');

async function testFullEmailGeneration() {
  console.log('🔍 Testing full email generation with QR code...\n');
  
  // Generate QR code as base64
  const attendanceUrl = 'https://luuj.cloud/attendance/test-registration-123';
  const qrCodeDataUri = await QRCode.toDataURL(attendanceUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 400,
    margin: 2,
  });
  
  console.log('✅ QR Code generated');
  console.log('   Data URI length:', qrCodeDataUri.length);
  console.log('   First 100 chars:', qrCodeDataUri.substring(0, 100));
  console.log('');
  
  // Simulate the default template
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Invitation - The LUUJ Lunch</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                You're Invited! 🎉
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">
                Hi John Doe,
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">
                Great news! Your registration for <strong>The LUUJ Lunch</strong> has been accepted.
              </p>
              
              <p style="margin: 20px 0; font-size: 16px; color: #333333;">
                Please save your QR code below. You'll need to present it at the event for check-in:
              </p>
              
              <!-- QR Code -->
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; padding: 20px; background-color: #ffffff; border: 2px solid #e0e0e0; border-radius: 8px;">
                  <img src="${qrCodeDataUri}" alt="Your QR Code" style="width: 200px; height: 200px; display: block;" />
                </div>
              </div>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; color: #666666;">
                We look forward to seeing you at the event!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
  console.log('✅ HTML template created');
  console.log('   Total length:', htmlContent.length);
  console.log('');
  
  // Send via Resend
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL.trim(),
      to: 'waseemghaly@gmail.com',
      subject: 'Test: Full Email with Embedded QR Code',
      html: htmlContent,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', result.data.id);
    console.log('');
    console.log('📧 Check your inbox at: waseemghaly@gmail.com');
    console.log('');
    console.log('Expected result:');
    console.log('  - Email should have content');
    console.log('  - QR code should be visible');
    console.log('  - QR code should be scannable');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFullEmailGeneration();
