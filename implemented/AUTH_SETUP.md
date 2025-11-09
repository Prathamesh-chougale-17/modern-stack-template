# Authentication & RBAC Setup Guide

This guide explains how to set up and use the authentication system with role-based access control (RBAC).

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

The project already includes Better Auth:
- `better-auth` - Core authentication library
- `better-auth/plugins` - Admin plugin for RBAC
- `better-auth/adapters/mongodb` - MongoDB adapter

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Generate a secure secret key:

```bash
openssl rand -base64 32
```

Update your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/game-aggregator
BETTER_AUTH_SECRET=<your-generated-secret>
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start MongoDB

Ensure MongoDB is running locally:

```bash
# macOS/Linux
mongod

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run the Development Server

```bash
bun dev
```

Visit http://localhost:3000

## Architecture Overview

### Authentication Flow

```
User → Sign Up/Sign In Page
  ↓
Better Auth API (/api/auth/[...all])
  ↓
MongoDB (user, session collections)
  ↓
Session Cookie Created
  ↓
Protected Routes (via proxy.ts)
```

### File Structure

```
lib/
├── auth.ts                 # Server-side auth configuration
├── auth-client.ts          # Client-side auth setup

app/
├── api/auth/[...all]/     # Auth API endpoints (Better Auth)
├── api/admin/users/       # Admin API for user management
├── (auth)/
│   ├── sign-in/           # Sign in page
│   └── sign-up/           # Sign up page
├── dashboard/             # Protected user dashboard
└── admin/                 # Protected admin panel

components/
├── auth/
│   └── sign-out-button.tsx
└── admin/
    ├── admin-header.tsx
    ├── user-management.tsx
    └── user-actions.tsx

proxy.ts                    # Route protection middleware
```

## User Roles

### Default Roles

1. **user** (default)
   - Access to dashboard
   - Can play games
   - View own profile

2. **admin**
   - All user permissions
   - Access to admin panel
   - Manage users (ban, delete, change roles)
   - View all sessions

3. **super-admin**
   - All admin permissions
   - Highest privilege level

### Role Assignment

**Via Admin Panel:**
1. Sign in as an admin
2. Navigate to `/admin`
3. Click actions menu on any user
4. Select "Change Role"

**Via Code (Server Action):**
```typescript
import { auth } from "@/lib/auth";

await auth.api.setRole({
  userId: "user-id",
  role: "admin",
});
```

**Via Client:**
```typescript
import { authClient } from "@/lib/auth-client";

await authClient.admin.setRole({
  userId: "user-id",
  role: "admin",
});
```

## Creating the First Admin User

### Method 1: Modify Database Directly

After creating your first user via sign-up:

```bash
# Connect to MongoDB
mongosh

# Use the database
use game-aggregator

# Update the user's role
db.user.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 2: Configure Admin User IDs

In `lib/auth.ts`, you can specify admin user IDs:

```typescript
export const auth = betterAuth({
  // ... other config
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin", "super-admin"],
      adminUserIds: ["user-id-1", "user-id-2"], // Add initial admin IDs
    }),
    nextCookies(),
  ],
});
```

## Protected Routes

### Middleware Protection

The `proxy.ts` file protects routes:

```typescript
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/sign-in", "/sign-up"],
};
```

### Adding New Protected Routes

Update `proxy.ts`:

```typescript
export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Add new protected route
  if (request.nextUrl.pathname.startsWith("/your-route")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/your-route/:path*"],
};
```

### Server-Side Protection

Always verify session on the server:

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Check role if needed
  const isAdmin = session.user.role === "admin";
  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <div>Protected Content</div>;
}
```

## Admin Operations

### User Management

```typescript
import { authClient } from "@/lib/auth-client";

// Ban user
await authClient.admin.banUser({
  userId: "user-id",
  banReason: "Violated terms",
  banExpiresIn: 86400, // Optional: seconds until unban
});

// Unban user
await authClient.admin.unbanUser({
  userId: "user-id",
});

// Delete user
await authClient.admin.removeUser({
  userId: "user-id",
});

// Change role
await authClient.admin.setRole({
  userId: "user-id",
  role: "admin",
});
```

### Session Management

```typescript
// List user sessions
const sessions = await authClient.admin.listUserSessions({
  userId: "user-id",
});

// Revoke session
await authClient.admin.revokeSession({
  sessionId: "session-id",
});

// Revoke all sessions
await authClient.admin.revokeUserSessions({
  userId: "user-id",
});
```

### User Impersonation

For debugging purposes, admins can impersonate users:

```typescript
await authClient.admin.impersonateUser({
  userId: "user-id",
});

// To stop impersonating
await authClient.admin.stopImpersonating();
```

## Using Authentication in Components

### Client Components

```typescript
"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}
```

### Server Components

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {session?.user.email}</p>
      <p>Role: {session?.user.role}</p>
    </div>
  );
}
```

### Server Actions

```typescript
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Update profile logic...
}
```

## Custom RBAC Rules

### Creating Custom Access Control

```typescript
import { createAccessControl } from "better-auth/plugins";

const ac = createAccessControl({
  user: {
    game: ["read", "play"],
  },
  admin: {
    game: ["read", "play", "create", "update", "delete"],
    user: ["read", "update", "delete"],
  },
});

export const auth = betterAuth({
  // ... config
  plugins: [
    admin({
      ac, // Use custom access control
    }),
  ],
});
```

### Checking Permissions

```typescript
// Client-side
const canDelete = await authClient.admin.checkRolePermission({
  resource: "user",
  action: "delete",
});

// Server-side
const hasPermission = await auth.api.hasPermission({
  headers: await headers(),
  resource: "game",
  action: "create",
});
```

## Database Collections

Better Auth creates these MongoDB collections:

### user
```typescript
{
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: "user" | "admin" | "super-admin";
  banned: boolean;
  banReason?: string;
  banExpires?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### session
```typescript
{
  id: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  impersonatedBy?: string;
  createdAt: Date;
}
```

### account
```typescript
{
  id: string;
  userId: string;
  providerId: string;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}
```

## Troubleshooting

### Common Issues

**1. "Unauthorized" error on protected routes**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify session cookie is being set

**2. Admin panel not accessible**
- Check user role in database
- Verify proxy middleware is running
- Check browser console for errors

**3. Environment variable errors**
- Ensure all required vars are in `.env`
- Restart dev server after env changes
- Generate new `BETTER_AUTH_SECRET` if needed

**4. Database connection errors**
- Verify MongoDB is running
- Check connection string format
- Ensure network access to MongoDB

### Debug Mode

Enable Better Auth debug logging:

```typescript
export const auth = betterAuth({
  // ... config
  logger: {
    level: "debug",
  },
});
```

## Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` for templates
2. **Use strong secrets** - Minimum 32 characters
3. **Enable email verification** in production
4. **Implement rate limiting** on auth endpoints
5. **Use HTTPS** in production
6. **Regularly rotate secrets**
7. **Audit admin actions** (add logging)
8. **Implement 2FA** for admin accounts (future enhancement)

## Next Steps

- [ ] Add email verification for production
- [ ] Implement OAuth providers (Google, GitHub)
- [ ] Add 2FA authentication
- [ ] Implement audit logging for admin actions
- [ ] Add rate limiting on auth endpoints
- [ ] Set up password reset flow
- [ ] Add account deletion confirmation
- [ ] Implement session management UI

## Resources

- [Better Auth Documentation](https://www.better-auth.com)
- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
