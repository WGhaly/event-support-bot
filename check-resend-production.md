# Resend Production Checklist

## ✅ Test Results
- Local test: **PASSED** ✅
- Email sent successfully from local environment
- API key format: Correct (starts with `re_`)
- FROM email: `onboarding@resend.dev`

## Issues Found

The test shows Resend IS working correctly locally. Here's what to check in production:

### 1. Check Vercel Function Logs
After sending an email from production, check the logs:
1. Go to https://vercel.com/waseemghaly-progressiosos-projects/thelujproject
2. Click on "Logs" tab
3. Look for the console.log statements from `src/lib/email.ts`:
   - "Attempting to send email"
   - "Email sent successfully" OR error messages
   
### 2. Verify Environment Variables in Vercel
Run: `vercel env ls`

Both should show as "Encrypted":
- RESEND_API_KEY ✅ (confirmed)
- RESEND_FROM_EMAIL ✅ (confirmed)

### 3. Common Issues with Resend

**Issue A: Using custom FROM domain without verification**
- If RESEND_FROM_EMAIL is NOT `onboarding@resend.dev`
- You must verify your domain in Resend dashboard
- Solution: Use `onboarding@resend.dev` for testing (no verification needed)

**Issue B: Rate limits**
- Free tier: 100 emails/day, 1 email/second
- Check Resend dashboard for quota

**Issue C: Email goes to spam**
- Check spam folder at waseemghaly@gmail.com
- Some email providers block automated emails

### 4. Testing in Production

To test if production is actually sending emails:

1. Go to your production site: https://thelujproject-nqlzj1l2g-waseemghaly-progressiosos-projects.vercel.app
2. Navigate to an event's registrations
3. Try to send an invitation to waseemghaly@gmail.com
4. Immediately check Vercel function logs
5. Check your email inbox (and spam folder)

### 5. Resend Dashboard Check

1. Log in to https://resend.com/emails
2. Check the "Emails" section
3. You should see all sent emails listed there
4. If emails appear there but don't arrive, it's a delivery issue (spam, etc.)
5. If emails don't appear there, the API call is failing

### 6. What the Code Does

In `src/lib/email.ts`:
```typescript
console.log('Attempting to send email:', {
  from: fromEmail,
  to,
  subject,
  hasCustomTemplate: !!customHtml,
})

const { data, error } = await resendClient.emails.send(emailContent)

if (error) {
  console.error('Resend error:', {
    message: error.message,
    name: error.name,
    statusCode: (error as any).statusCode,
    hasApiKey: !!process.env.RESEND_API_KEY,
  })
  throw new Error(`Failed to send email: ${error.message}`)
}

console.log('Email sent successfully:', data.id)
```

All of this will appear in Vercel function logs!

## Next Steps

1. **Check Vercel logs** after sending an email in production
2. **Check Resend dashboard** at https://resend.com/emails
3. **Check spam folder** at waseemghaly@gmail.com
4. If logs show success but no email arrives → delivery/spam issue
5. If logs show error → share the error message for debugging

## Likely Causes

Based on "email says sent but nothing arrives":

**Most likely**: Emails ARE being sent but going to spam
- Solution: Check spam folder
- Solution: Add SPF/DKIM records if using custom domain

**Second most likely**: Using custom FROM domain without verification
- Solution: Change to `onboarding@resend.dev` in Vercel env vars
- Or verify your domain in Resend dashboard

**Less likely**: API key invalid in production (but test worked locally)
- Would show error in Vercel logs
- Recheck env vars are in "Production" environment
