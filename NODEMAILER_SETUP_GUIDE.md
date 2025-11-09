# Nodemailer Setup Guide

This guide will help you configure nodemailer to send emails for OTP verification, password resets, and other authentication-related emails in the Game Aggregator application.

## Table of Contents
1. [Overview](#overview)
2. [Gmail Setup](#gmail-setup)
3. [SendGrid Setup](#sendgrid-setup)
4. [Mailgun Setup](#mailgun-setup)
5. [AWS SES Setup](#aws-ses-setup)
6. [Outlook/Office 365 Setup](#outlookoffice-365-setup)
7. [Testing Email Sending](#testing-email-sending)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The application uses **nodemailer** to send emails through SMTP. You can use any SMTP provider. The most common options are:

- **Gmail** (Free, easy for development)
- **SendGrid** (Generous free tier, reliable)
- **Mailgun** (Good free tier, developer-friendly)
- **AWS SES** (Very cheap, requires AWS account)
- **Outlook/Office 365** (Free with Microsoft account)

All email templates are located in `lib/email/templates.ts` and include:
- Sign-in OTP emails
- Email verification emails
- Password reset emails
- Welcome emails
- Security alert emails

---

## Gmail Setup

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other" as the device and enter "Game Aggregator"
4. Click "Generate"
5. Copy the 16-character password (spaces will be removed automatically)

### Step 3: Configure Environment Variables

Add to your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Game Aggregator
```

**Note**: Gmail has a sending limit of **500 emails per day** for free accounts.

---

## SendGrid Setup

### Step 1: Create SendGrid Account

1. Sign up at [SendGrid](https://signup.sendgrid.com/)
2. Verify your email address
3. Complete the sender authentication

### Step 2: Create API Key

1. Go to [API Keys](https://app.sendgrid.com/settings/api_keys)
2. Click "Create API Key"
3. Choose "Restricted Access"
4. Enable "Mail Send" permission
5. Copy the API key (you won't see it again!)

### Step 3: Verify Sender Identity

1. Go to [Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Choose "Single Sender Verification" (easiest for development)
3. Fill in your details and verify the email

### Step 4: Configure Environment Variables

Add to your `.env` file:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=verified-sender@yourdomain.com
SMTP_FROM_NAME=Game Aggregator
```

**Note**: The username is literally `apikey` - don't change it!

**Free Tier**: 100 emails/day forever

---

## Mailgun Setup

### Step 1: Create Mailgun Account

1. Sign up at [Mailgun](https://signup.mailgun.com/)
2. Verify your email and phone number

### Step 2: Get SMTP Credentials

1. Go to [Sending Domains](https://app.mailgun.com/app/sending/domains)
2. Click on your sandbox domain (or add a custom domain)
3. Go to "Domain Settings" → "SMTP credentials"
4. Create SMTP credentials or use existing ones

### Step 3: Configure Environment Variables

Add to your `.env` file:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@sandboxXXXXXXXX.mailgun.org
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@sandboxXXXXXXXX.mailgun.org
SMTP_FROM_NAME=Game Aggregator
```

**Free Tier**:
- Sandbox domain: 100 emails/day
- Custom domain (verified): 5,000 emails/month for 3 months

---

## AWS SES Setup

### Step 1: Create AWS Account

1. Sign up at [AWS](https://aws.amazon.com/)
2. Navigate to [Amazon SES Console](https://console.aws.amazon.com/ses/)

### Step 2: Verify Email Address

1. Go to "Verified Identities"
2. Click "Create Identity"
3. Choose "Email Address"
4. Enter your email and verify it

### Step 3: Create SMTP Credentials

1. Go to "SMTP Settings"
2. Click "Create SMTP Credentials"
3. Enter a username (e.g., "game-aggregator-smtp")
4. Download and save the credentials

### Step 4: Request Production Access (Optional)

By default, SES is in sandbox mode (can only send to verified addresses).

1. Go to "Account Dashboard"
2. Click "Request production access"
3. Fill out the form explaining your use case

### Step 5: Configure Environment Variables

Add to your `.env` file:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=verified-email@yourdomain.com
SMTP_FROM_NAME=Game Aggregator
```

**Note**: Change the region in `SMTP_HOST` based on your AWS region.

**Pricing**: $0.10 per 1,000 emails (very cheap!)

---

## Outlook/Office 365 Setup

### Step 1: Enable SMTP AUTH

1. Go to [Outlook Settings](https://outlook.live.com/mail/0/options/mail/accounts)
2. Click "Sync email"
3. Ensure "Let apps use SMTP" is enabled

### Step 2: Configure Environment Variables

Add to your `.env` file:

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-outlook-password
SMTP_FROM_EMAIL=your-email@outlook.com
SMTP_FROM_NAME=Game Aggregator
```

**Note**: For Office 365 accounts, use `smtp.office365.com` as the host.

**Sending Limits**: 300 emails per day

---

## Testing Email Sending

### Method 1: Sign Up with Email

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/sign-up`
3. Register with your email
4. Check your inbox for the verification OTP

### Method 2: Use Email OTP Sign-In

1. Go to `http://localhost:3000/sign-in-otp`
2. Enter your email
3. Check your inbox for the OTP code
4. Enter the code to sign in

### Method 3: Test via Node.js Script

Create a test script `test-email.ts`:

```typescript
import { sendEmail } from "./lib/email/mailer";
import { emailTemplates } from "./lib/email/templates";

async function testEmail() {
  try {
    const result = await sendEmail({
      to: "your-test-email@example.com",
      subject: "Test Email",
      html: emailTemplates.signInOTP("123456", 5),
    });
    console.log("✅ Email sent successfully:", result);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

testEmail();
```

Run with: `npx tsx test-email.ts`

---

## Troubleshooting

### "Invalid login: 535 Authentication failed"

**Cause**: Wrong username or password

**Solutions**:
- Double-check your SMTP credentials
- For Gmail, ensure you're using an App Password, not your regular password
- For SendGrid, ensure username is exactly `apikey`

---

### "Connection timeout"

**Cause**: SMTP port is blocked or wrong host

**Solutions**:
- Try port 465 with `SMTP_SECURE=true`
- Check if your firewall/antivirus is blocking SMTP
- Verify the SMTP host is correct

---

### "Cannot find module 'nodemailer'"

**Cause**: Package not installed

**Solution**:
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

---

### Emails going to spam

**Solutions**:
1. **Use a verified domain**: Set up SPF, DKIM, and DMARC records
2. **Verify your sender identity**: Complete provider verification
3. **Warm up your sending**: Start with low volume
4. **Use a professional from address**: Avoid generic names

---

### Gmail "Less secure app access"

**Note**: This option is deprecated. You **must** use App Passwords with 2FA enabled.

---

## Development vs Production

### Development

- Use console logging (already implemented in the code)
- Test with sandbox domains (Mailgun) or limited accounts
- Send emails to yourself for testing

The code automatically logs OTPs to console in development:

```typescript
if (env.NODE_ENV === "development") {
  console.log(`[Email OTP] Sending ${type} OTP to ${email}: ${otp}`);
}
```

### Production

- Use a reliable SMTP provider (SendGrid, SES, Mailgun)
- Set up custom domain with SPF/DKIM/DMARC
- Enable `requireEmailVerification: true` in `lib/auth.ts`
- Monitor email delivery rates
- Set up webhook handlers for bounces/complaints

---

## Email Templates

All templates are in `lib/email/templates.ts` with:

- **Dark theme** design matching your app
- **Gradient accents** (purple-blue)
- **Responsive** HTML
- **Professional** formatting

Templates available:
1. `signInOTPTemplate(otp, expiresInMinutes)` - OTP sign-in
2. `emailVerificationTemplate(otp, expiresInMinutes)` - Email verification
3. `passwordResetTemplate(otp, expiresInMinutes)` - Password reset
4. `welcomeEmailTemplate(name)` - Welcome new users
5. `securityAlertTemplate(action, ipAddress, userAgent)` - Security notifications

You can customize these templates to match your branding!

---

## Security Best Practices

1. **Never commit SMTP credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate credentials regularly**
4. **Enable 2FA** on your email provider account
5. **Use restricted API keys** with minimal permissions
6. **Monitor sending limits** to prevent abuse
7. **Implement rate limiting** on OTP requests (already done: `allowedAttempts: 3`)
8. **Use HTTPS** in production for `BETTER_AUTH_URL`

---

## Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Better Auth Email OTP Plugin](https://www.better-auth.com/docs/plugins/email-otp)
- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Guide](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [AWS SES Developer Guide](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review your SMTP provider's documentation
3. Check the console logs for detailed error messages
4. Verify your environment variables are correctly set

For application-specific issues, refer to the main authentication documentation in `OTP_AND_GOOGLE_AUTH_GUIDE.md`.
