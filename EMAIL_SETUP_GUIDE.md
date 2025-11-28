# 📧 Email Integration Setup Guide

## Overview

The Event Registration module includes a complete email blast system powered by Resend. This guide will help you set up email functionality.

## Prerequisites

1. ✅ Resend package installed (`npm install resend`)
2. ⚠️ Resend API key (sign up at https://resend.com)
3. ⚠️ Verified domain or email address in Resend

## Step 1: Sign Up for Resend

1. Visit [https://resend.com](https://resend.com)
2. Create a free account
3. Verify your email address
4. Navigate to API Keys section
5. Generate a new API key

**Free Tier Includes:**
- 3,000 emails/month
- 100 emails/day
- Perfect for testing and small events

## Step 2: Add Environment Variables

Add these variables to your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# From Email Address (must be verified in Resend)
RESEND_FROM_EMAIL=events@yourdomain.com

# Base URL for QR code links in emails
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### For Development:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev  # Use Resend's test email
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### For Production:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=events@yourdomain.com  # Your verified domain
NEXT_PUBLIC_BASE_URL=https://your-production-url.com
```

## Step 3: Verify Your Domain (Production Only)

For production, you need to verify your sending domain:

1. Go to Resend Dashboard → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the provided DNS records to your domain:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)
5. Wait for verification (usually takes a few minutes)

**Quick Start for Testing:**
Use `onboarding@resend.dev` which doesn't require verification, but emails can only be sent to your verified Resend account email.

## Step 4: Test Email Configuration

### Method 1: Use the Application

1. Create an event
2. Build a registration form
3. Create a test registration
4. Accept the registration
5. Select it and click "Send Invites"
6. Check your email inbox

### Method 2: API Test

```bash
curl -X POST http://localhost:3000/api/registrations/[REGISTRATION_ID]/send-invite \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"
```

## Features Included

### ✅ Individual Email Sending
- Send invitation to single attendee
- Includes personalized QR code
- Custom or default template
- Automatic tracking (inviteSent flag)

### ✅ Bulk Email Sending
- Send to multiple attendees at once
- Only sends to accepted registrations
- Only sends to those who haven't received invite yet
- Rate limiting (100ms delay between emails)
- Detailed success/failure reporting

### ✅ Email Template Builder
- Visual editor with blocks
- Text, image, button, QR code blocks
- Live preview with sample data
- Variable replacement system
- Code editor for custom HTML
- Save templates per event

### ✅ Template Variables
Use these variables in your email templates:
- `{attendeeName}` - Attendee's name from form
- `{eventName}` - Event name
- `{eventDate}` - Event start date
- `{eventLocation}` - Event location
- `{qrCodeUrl}` - Attendance page URL with QR code
- `{registrationId}` - Unique registration identifier

### ✅ Default Template
If no custom template is created, a beautiful default template is used with:
- Gradient header
- Event details section
- QR code display
- Download button
- Responsive design
- Dark/light mode friendly

## Usage Guide

### For Event Creators:

1. **Create Event** → Set up your event details
2. **Build Form** → Add registration fields
3. **Customize Email** (Optional):
   - Click "Email Template" card
   - Use visual editor or code editor
   - Add your branding and messaging
   - Preview with sample data
   - Save template
4. **Review Registrations**:
   - Go to "Registrations" page
   - Accept registrations you want to invite
5. **Send Invitations**:
   - Select accepted registrations
   - Click "Send Invites" button
   - Confirm and wait for completion
   - Check sent status in table

### For Attendees:

1. Receive email invitation
2. Email contains:
   - Event details
   - QR code image
   - Download button for QR code
   - Registration ID
3. Save QR code or screenshot
4. Present at event for check-in

## API Endpoints

### Save Email Template
```
POST /api/events/[id]/email-template
Body: { "template": "<html>...</html>" }
```

### Get Email Template
```
GET /api/events/[id]/email-template
Response: { "template": "<html>...</html>" }
```

### Send Individual Invite
```
POST /api/registrations/[id]/send-invite
Response: { "success": true }
```

### Send Bulk Invites
```
POST /api/events/[id]/registrations/send-bulk
Body: { "registrationIds": ["id1", "id2", ...] }
Response: {
  "success": true,
  "sent": 5,
  "failed": 0,
  "total": 5,
  "errors": []
}
```

## Troubleshooting

### "Email functionality will not work" Warning
**Cause:** `RESEND_API_KEY` not set in environment variables
**Fix:** Add the API key to `.env.local` and restart the server

### Emails Not Sending
**Possible Causes:**
1. Invalid API key → Check Resend dashboard
2. Domain not verified → Use `onboarding@resend.dev` for testing
3. Rate limit exceeded → Free tier: 100/day, 3000/month
4. Invalid recipient email → Check email format

### "Failed to send email" Error
**Debug Steps:**
1. Check server logs for detailed error
2. Verify API key is correct
3. Check Resend dashboard for logs
4. Ensure FROM email is verified
5. Check recipient email is valid

### Emails Going to Spam
**Solutions:**
1. Verify your domain with SPF/DKIM/DMARC
2. Use a professional "from" address
3. Avoid spam trigger words in subject/content
4. Keep sending volume consistent
5. Monitor Resend deliverability metrics

### Rate Limiting
**Free Tier Limits:**
- 100 emails per day
- 3,000 emails per month

**Code handles rate limiting:**
- 100ms delay between each email
- Bulk sending processes sequentially
- Detailed success/failure reporting

**To increase limits:**
- Upgrade to Pro plan ($20/month for 50,000 emails)

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Verify event ownership** before sending emails (✅ implemented)
4. **Only send to accepted registrations** (✅ implemented)
5. **Track sent status** to prevent duplicates (✅ implemented)
6. **Validate email addresses** before sending
7. **Monitor for abuse** - implement daily limits per user if needed

## Cost Estimation

### Free Tier (Included with Resend):
- Perfect for events with <100 attendees
- 3,000 emails/month
- $0 cost

### Pro Tier ($20/month):
- Events with 100-1000+ attendees
- 50,000 emails/month
- Better deliverability
- Priority support

### Example Costs:
- Event with 50 attendees: **FREE**
- Event with 500 attendees: **FREE** (if under 3000/month)
- Event with 5000 attendees: **$20/month**

## Production Checklist

Before going live:

- [ ] Sign up for Resend account
- [ ] Verify your sending domain
- [ ] Add DNS records (SPF, DKIM, DMARC)
- [ ] Set `RESEND_API_KEY` in production environment
- [ ] Set `RESEND_FROM_EMAIL` with verified address
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production URL
- [ ] Test email sending in production
- [ ] Create custom email template with branding
- [ ] Test QR code links work correctly
- [ ] Monitor Resend dashboard for deliverability
- [ ] Set up email bounce notifications (optional)

## Support

### Resend Documentation
- Website: https://resend.com/docs
- API Reference: https://resend.com/docs/api-reference
- Dashboard: https://resend.com/dashboard

### Project Support
- Check server logs for detailed errors
- Review API responses for error messages
- Test with Resend's test email for debugging
- Use Resend dashboard to monitor delivery status

## Summary

✅ **Email system is fully functional**
✅ **Resend package installed**
✅ **API endpoints created**
✅ **Email template builder complete**
✅ **Bulk sending implemented**
⚠️ **Requires RESEND_API_KEY to send emails**

Once you add the API key, the email system will work immediately with no code changes needed!
