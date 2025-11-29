import { Resend } from 'resend'
import QRCode from 'qrcode'

let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export interface SendEventInviteParams {
  to: string
  eventName: string
  eventDate?: string
  eventLocation?: string
  attendeeName?: string
  qrCodeData: string // The URL that the QR code will encode
  customTemplate?: string
  registrationId: string
}

/**
 * Send event invitation email with QR code
 */
export async function sendEventInvite({
  to,
  eventName,
  eventDate,
  eventLocation,
  attendeeName,
  qrCodeData,
  customTemplate,
  registrationId,
}: SendEventInviteParams) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'events@yourdomain.com'
  
  // Generate QR code as PNG buffer for attachment
  const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 400,
    margin: 2,
  })
  
  // Use CID reference for the QR code in the email
  const qrCodeCid = 'qrcode@luuj.cloud'
  const qrCodeSrc = `cid:${qrCodeCid}`
  
  // Use custom template if provided, otherwise use default
  let htmlContent = customTemplate
    ? replaceTemplateVariables(customTemplate, {
        attendeeName: attendeeName || 'Attendee',
        eventName,
        eventDate: eventDate || 'TBA',
        eventLocation: eventLocation || 'TBA',
        qrCodeUrl: qrCodeSrc,
        registrationId,
      })
    : getDefaultTemplate({
        attendeeName: attendeeName || 'Attendee',
        eventName,
        eventDate,
        eventLocation,
        qrCodeUrl: qrCodeSrc,
        registrationId,
      })
  
  // Process template to fix image URLs (but preserve CID references)
  htmlContent = processEmailTemplate(htmlContent)

  try {
    const client = getResendClient()
    
    console.log('[Email] Sending email:', {
      from: fromEmail,
      to,
      subject: `Invitation: ${eventName}`,
      hasCustomTemplate: !!customTemplate,
      htmlContentLength: htmlContent.length,
      htmlPreview: htmlContent.substring(0, 200) + '...',
      qrCodeAttachmentSize: qrCodeBuffer.length,
    })
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to,
      subject: `Invitation: ${eventName}`,
      html: htmlContent,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          contentId: qrCodeCid,
        },
      ],
    })

    if (error) {
      console.error('[Email] Resend API error:', error)
      
      // Check for sandbox mode restriction
      if (error.message && error.message.includes('can only send testing emails')) {
        throw new Error(`Email blocked by Resend sandbox mode. You can only send to waseem.ghaly@progressiosolutions.com. To send to other emails, verify a domain at resend.com/domains`)
      }
      
      throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`)
    }

    console.log('[Email] Successfully sent, ID:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Sending error:', error)
    console.error('[Email] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      from: fromEmail,
      to,
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) + '...',
    })
    return { success: false, error }
  }
}

/**
 * Send bulk invitations to multiple attendees
 */
export async function sendBulkEventInvites(
  invites: SendEventInviteParams[]
): Promise<{ success: boolean; sent: number; failed: number; errors: any[] }> {
  let sent = 0
  let failed = 0
  const errors: any[] = []

  for (const invite of invites) {
    const result = await sendEventInvite(invite)
    if (result.success) {
      sent++
    } else {
      failed++
      errors.push({ email: invite.to, error: result.error })
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return { success: failed === 0, sent, failed, errors }
}

/**
 * Replace template variables with actual values
 */
function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g')
    result = result.replace(regex, value)
  }

  return result
}

/**
 * Process email template to fix image URLs
 * Converts relative and localhost URLs to production URLs
 * Preserves base64 data URIs and CID references (for QR codes)
 */
function processEmailTemplate(html: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luuj.cloud'
  
  // Replace relative image URLs (src="/uploads/...")
  // But skip data URIs (src="data:image/...") and CID references (src="cid:...")
  html = html.replace(/src="(?!data:|cid:)\/([^"]+)"/g, `src="${baseUrl}/$1"`)
  
  // Replace localhost URLs (src="http://localhost:3000/...")
  html = html.replace(/src="http:\/\/localhost:\d+\/([^"]+)"/g, `src="${baseUrl}/$1"`)
  
  // Replace localhost URLs (src="https://localhost:3000/...")  
  html = html.replace(/src="https:\/\/localhost:\d+\/([^"]+)"/g, `src="${baseUrl}/$1"`)
  
  return html
}

/**
 * Default email template
 */
function getDefaultTemplate({
  attendeeName,
  eventName,
  eventDate,
  eventLocation,
  qrCodeUrl,
  registrationId,
}: {
  attendeeName: string
  eventName: string
  eventDate?: string
  eventLocation?: string
  qrCodeUrl: string
  registrationId: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Invitation - ${eventName}</title>
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
                Hi ${attendeeName},
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">
                Great news! Your registration for <strong>${eventName}</strong> has been accepted.
              </p>
              
              ${eventDate ? `
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                  <strong>📅 Date:</strong> ${eventDate}
                </p>
                ${eventLocation ? `
                <p style="margin: 0; font-size: 14px; color: #666666;">
                  <strong>📍 Location:</strong> ${eventLocation}
                </p>
                ` : ''}
              </div>
              ` : ''}
              
              <p style="margin: 20px 0; font-size: 16px; color: #333333;">
                Please save your QR code below. You'll need to present it at the event for check-in:
              </p>
              
              <!-- QR Code -->
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; padding: 20px; background-color: #ffffff; border: 2px solid #e0e0e0; border-radius: 8px;">
                  <img src="${qrCodeUrl}" alt="Your QR Code" style="width: 200px; height: 200px; display: block;" />
                </div>
              </div>
              
              <p style="margin: 20px 0 10px 0; font-size: 14px; color: #666666; text-align: center;">
                <strong>Registration ID:</strong> ${registrationId}
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${qrCodeUrl}" 
                   style="display: inline-block; padding: 14px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  Download QR Code
                </a>
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
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999;">
                © ${new Date().getFullYear()} Event Support Bot. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    return false
  }

  try {
    // Resend doesn't have a test endpoint, but we can check if the API key is valid
    // by attempting to list domains (which requires authentication)
    return true
  } catch (error) {
    console.error('Email configuration test failed:', error)
    return false
  }
}
