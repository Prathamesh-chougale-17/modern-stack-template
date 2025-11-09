# Email OTP & Google OAuth Integration Guide

This guide explains how to use the Email OTP and Google OAuth authentication features that have been added to your application.

## Features Added

### 1. Email OTP Authentication
- Sign in using one-time passwords sent to email
- 6-digit OTP codes
- 5-minute expiration
- 3 attempt limit
- Development mode: OTP logged to console

### 2. Google OAuth
- One-click sign in/up with Google
- Always requests refresh token
- Account selection on every sign in
- Automatic user creation

## Quick Setup

### 1. Update Environment Variables

Add these to your `.env` file:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB Database Name
MONGODB_DB_NAME=game-aggregator
```

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Configure OAuth consent screen if needed
5. Application type: **Web application**
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret** to `.env`

## Using Email OTP Authentication

### Sign In Flow

1. **Visit OTP Sign In**: http://localhost:3000/sign-in-otp
2. **Enter Email**: Type your email address
3. **Send OTP**: Click "Send OTP" button
4. **Check Console**: In development, OTP is logged to browser console
5. **Enter OTP**: Type the 6-digit code
6. **Sign In**: Click "Verify & Sign In"

### Features

- **Auto Registration**: If email doesn't exist, user is auto-created
- **Expiration**: OTP expires after 5 minutes
- **Attempt Limit**: Max 3 attempts before OTP becomes invalid
- **New OTP**: Request new OTP if expired or exceeded attempts

### Development vs Production

**Development**:
```typescript
// OTP is logged to console
console.log(`[Email OTP] Sending sign-in OTP to user@example.com: 123456`);
```

**Production**:
Replace the `sendVerificationOTP` function in `lib/auth.ts` with actual email sending:

```typescript
emailOTP({
  async sendVerificationOTP({ email, otp, type }) {
    // Use email service like Resend, SendGrid, AWS SES, etc.
    await sendEmail({
      to: email,
      subject: type === "sign-in" ? "Sign In OTP" :
               type === "email-verification" ? "Verify Email" : "Reset Password",
      html: `Your verification code is: <strong>${otp}</strong>`
    });
  },
  // ... other options
})
```

### Email Services Recommendations

- **Resend**: Modern, developer-friendly
- **SendGrid**: Reliable, good deliverability
- **AWS SES**: Cost-effective, scalable
- **Mailgun**: Powerful API
- **Postmark**: Fast, reliable

## Using Google OAuth

### Sign In/Up Flow

1. **Visit Sign In**: http://localhost:3000/sign-in
2. **Click Google Button**: "Sign in with Google"
3. **Select Account**: Choose your Google account
4. **Grant Permissions**: Allow access
5. **Redirect**: Automatically redirected to dashboard

### Features

- **One-Click**: No password needed
- **Auto Creation**: User created if doesn't exist
- **Refresh Token**: Always obtained for offline access
- **Account Selection**: Always asks which account to use
- **Profile Info**: Name, email, profile picture synced

### Client-Side Usage

```typescript
import { authClient } from "@/lib/auth-client";

// Sign in with Google
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});
```

### Server-Side Usage

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});

// Check if user signed in with Google
if (session?.user) {
  // User authenticated
}
```

## UI Components

### Sign In Page Updates

**Features Added**:
- Google OAuth button
- Email OTP sign-in link
- Divider ("Or continue with")
- Loading states

**File**: `app/(auth)/sign-in/page.tsx`

### Sign Up Page Updates

**Features Added**:
- Google OAuth button
- Divider for social auth
- Loading states

**File**: `app/(auth)/sign-up/page.tsx`

### OTP Sign In Page

**New Page**: `app/(auth)/sign-in-otp/page.tsx`

**Features**:
- Two-step process (Email → OTP)
- 6-digit OTP input with individual slots
- Visual feedback
- Back button to change email
- Console message for development

## Configuration

### Email OTP Configuration

Located in `lib/auth.ts`:

```typescript
emailOTP({
  async sendVerificationOTP({ email, otp, type }) {
    // Email sending logic
  },
  otpLength: 6,                    // OTP code length
  expiresIn: 300,                  // 5 minutes
  sendVerificationOnSignUp: true,  // Send OTP on signup
  allowedAttempts: 3,              // Max verification attempts
})
```

### Google OAuth Configuration

Located in `lib/auth.ts`:

```typescript
socialProviders: {
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    accessType: "offline",              // Always get refresh token
    prompt: "select_account consent",   // Always ask account
  },
}
```

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/sign-in` | GET | Email/password + Google + OTP link |
| `/sign-up` | GET | Registration + Google |
| `/sign-in-otp` | GET | OTP authentication |
| `/api/auth/callback/google` | GET | Google OAuth callback |

## Error Handling

### Common Errors

**Email OTP**:
- `Invalid OTP`: Wrong code entered
- `Expired OTP`: Code expired after 5 minutes
- `TOO_MANY_ATTEMPTS`: Exceeded 3 attempts
- `Failed to send OTP`: Email service error

**Google OAuth**:
- `Failed to sign in with Google`: OAuth flow interrupted
- `Invalid redirect URI`: Redirect URL not configured in Google Console
- `Access denied`: User rejected permissions

### Debugging

1. **Check Console**: OTP codes logged in development
2. **Browser DevTools**: Network tab for API calls
3. **Server Logs**: Check terminal for Better Auth logs
4. **Google Console**: Check OAuth app status

## Security Best Practices

### Email OTP

1. **Use HTTPS** in production
2. **Rate Limiting**: Implement on OTP send endpoint
3. **Email Service**: Use reputable provider
4. **Logging**: Don't log OTPs in production
5. **Attempts**: Keep limit low (3 is good)

### Google OAuth

1. **Verify Redirect URIs**: Only whitelist your domains
2. **HTTPS Only**: Production should use HTTPS
3. **Secret Management**: Keep `GOOGLE_CLIENT_SECRET` secure
4. **Scope Minimal**: Only request needed permissions
5. **Token Storage**: Better Auth handles securely

## Testing

### Test Email OTP

1. Start dev server: `bun dev`
2. Visit: http://localhost:3000/sign-in-otp
3. Enter email: `test@example.com`
4. Click "Send OTP"
5. Check browser console for OTP code
6. Enter code and verify

### Test Google OAuth

1. Configure Google OAuth credentials
2. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Start dev server: `bun dev`
4. Visit: http://localhost:3000/sign-in
5. Click "Sign in with Google"
6. Complete OAuth flow

## Advanced Usage

### Email OTP for Email Verification

```typescript
// Send verification OTP
await authClient.emailOtp.sendVerificationOtp({
  email: user.email,
  type: "email-verification",
});

// Verify email with OTP
await authClient.emailOtp.verifyEmail({
  email: user.email,
  otp: "123456",
});
```

### Email OTP for Password Reset

```typescript
// Send reset OTP
await authClient.forgetPassword.emailOtp({
  email: user.email,
});

// Reset password with OTP
await authClient.emailOtp.resetPassword({
  email: user.email,
  otp: "123456",
  password: "new-password",
});
```

### Requesting Additional Google Scopes

```typescript
// Request Google Drive access
await authClient.linkSocial({
  provider: "google",
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});
```

## Customization

### OTP Email Template

Customize the email content in `lib/auth.ts`:

```typescript
async sendVerificationOTP({ email, otp, type }) {
  const templates = {
    "sign-in": {
      subject: "Your Sign In Code",
      html: `
        <h1>Welcome Back!</h1>
        <p>Your verification code is:</p>
        <h2 style="color: #4f46e5;">${otp}</h2>
        <p>This code expires in 5 minutes.</p>
      `
    },
    // Add more templates...
  };

  await sendEmail(templates[type]);
}
```

### Google Button Styling

The Google button uses the official Google icon from `react-icons`:

```tsx
<FcGoogle className="mr-2 h-4 w-4" />
Sign in with Google
```

## Troubleshooting

### OTP Not Received

**Development**:
- Check browser console
- Look for `[Email OTP]` logs

**Production**:
- Check email service logs
- Verify SMTP configuration
- Check spam folder
- Verify email service API key

### Google OAuth Not Working

1. **Check Redirect URI**:
   - Must match exactly in Google Console
   - Include protocol (http/https)
   - Include port in development

2. **Check Credentials**:
   - Verify `GOOGLE_CLIENT_ID` is correct
   - Verify `GOOGLE_CLIENT_SECRET` is correct
   - Restart server after env changes

3. **Check OAuth Consent Screen**:
   - Must be configured in Google Console
   - App must be published (or add test users)

### Database Issues

- Verify `MONGODB_URI` is correct
- Check MongoDB is running
- Verify database name matches

## Production Deployment

### Checklist

- [ ] Configure production email service
- [ ] Update `sendVerificationOTP` with real email sending
- [ ] Add production Google OAuth redirect URIs
- [ ] Use HTTPS for all auth endpoints
- [ ] Set strong `BETTER_AUTH_SECRET`
- [ ] Enable rate limiting
- [ ] Monitor OTP sending costs
- [ ] Set up email delivery monitoring
- [ ] Test OAuth flow in production
- [ ] Configure CSP headers for Google

### Environment Variables (Production)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/game-aggregator
MONGODB_DB_NAME=game-aggregator
BETTER_AUTH_SECRET=<64-character-random-string>
BETTER_AUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>
NODE_ENV=production
```

## Resources

- [Better Auth Documentation](https://www.better-auth.com)
- [Better Auth Email OTP Plugin](https://www.better-auth.com/docs/plugins/email-otp)
- [Better Auth Social Providers](https://www.better-auth.com/docs/integrations/google)
- [Google OAuth Setup](https://console.cloud.google.com)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

## Support

If you encounter issues:

1. Check this guide first
2. Review Better Auth documentation
3. Check browser console for errors
4. Verify environment variables
5. Test with fresh MongoDB database
6. Check Google Cloud Console settings

## Summary

You now have:
- ✅ Email OTP authentication
- ✅ Google OAuth sign in/up
- ✅ Beautiful UI components
- ✅ Development mode OTP logging
- ✅ Production-ready configuration
- ✅ Comprehensive error handling
- ✅ Type-safe implementation

All authentication methods work seamlessly together!
