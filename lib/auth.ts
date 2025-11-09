import { betterAuth } from "better-auth";
import { admin, emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import client from "@/lib/mongodb";
import { env } from "@/env";

const db = client.db(env.MONGODB_DB_NAME);

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      accessType: "offline", // Always get refresh token
      prompt: "select_account consent", // Always ask to select account
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin", "super-admin"],
      impersonationSessionDuration: 3600, // 1 hour
      defaultBanReason: "Violated terms of service",
      bannedUserMessage:
        "Your account has been suspended. Please contact support.",
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // In production, send actual emails using services like:
        // - Resend, SendGrid, AWS SES, Mailgun, etc.
        console.log(`[Email OTP] Sending ${type} OTP to ${email}: ${otp}`);

        // For development, just log the OTP
        // In production, replace with actual email sending:
        // await sendEmail({
        //   to: email,
        //   subject: type === "sign-in" ? "Sign In OTP" :
        //            type === "email-verification" ? "Verify Email" : "Reset Password",
        //   html: `Your verification code is: <strong>${otp}</strong>`
        // });
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      sendVerificationOnSignUp: true,
      allowedAttempts: 3,
    }),
    nextCookies(), // Must be last plugin
  ],
});

export type Session = typeof auth.$Infer.Session;
