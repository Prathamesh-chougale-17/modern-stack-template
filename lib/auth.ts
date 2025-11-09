import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
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
    nextCookies(), // Must be last plugin
  ],
});

export type Session = typeof auth.$Infer.Session;
