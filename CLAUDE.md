# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Algorand-based game aggregator platform built with Next.js 16, React 19, TypeScript, and MongoDB. The application features blockchain-integrated games with staking mechanics and uses oRPC for type-safe client-server communication.

## Development Commands

### Package Manager
This project uses **Bun** (not npm/yarn/pnpm). All package operations should use `bun`:
```bash
bun install          # Install dependencies
bun add <package>    # Add a package
bun remove <package> # Remove a package
```

### Common Commands
```bash
bun dev              # Start development server (http://localhost:3000)
bun build            # Build for production
bun start            # Start production server
bun lint             # Run ESLint
```

### API Documentation
When the dev server is running:
- **Interactive API docs**: http://localhost:3000/api
- **OpenAPI spec**: http://localhost:3000/api/openapi

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 + Next.js 16 (App Router) + TypeScript
- **API Layer**: oRPC for type-safe RPC with automatic OpenAPI generation
- **Authentication**: Better Auth with RBAC (Role-Based Access Control)
- **Database**: MongoDB
- **Email**: Nodemailer with SMTP (OTP verification, password reset, welcome emails)
- **UI**: shadcn/ui + Tailwind CSS v4 + Radix UI
- **State**: React Query (server state), React Hook Form (forms), nuqs (URL state)
- **AI**: Google Gemini (via Vercel AI SDK)
- **Styling**: Tailwind CSS v4 with next-themes for dark/light mode

### Key Directories
```
app/                    # Next.js App Router (pages, layouts, API routes)
  (auth)/               # Authentication pages (sign-in, sign-up)
  dashboard/            # User dashboard
  admin/                # Admin panel (RBAC protected)
  api/auth/[...all]/    # Better Auth API routes
  api/admin/            # Admin API endpoints
  rpc/[[...rest]]/      # Main RPC/REST API handler
  api/                  # API documentation endpoints
components/             # React components
  auth/                 # Authentication components
  admin/                # Admin panel components
  games/                # Game-specific components (rock-paper-scissor, showdown)
  ui/                   # shadcn/ui components (40+ components)
lib/                    # Core utilities and configuration
  auth.ts               # Better Auth server configuration
  auth-client.ts        # Better Auth client setup
  router.ts             # oRPC procedure definitions (ADD NEW API ROUTES HERE)
  orpc.ts               # Client-side oRPC client
  orpc.server.ts        # Server-side oRPC client (for SSR)
  mongodb.ts            # MongoDB client setup
  email/                # Email configuration
    mailer.ts           # Nodemailer transporter and sendEmail utility
    templates.ts        # HTML email templates (OTP, welcome, security alerts)
ai/                     # AI configuration (Google Gemini)
hooks/                  # Custom React hooks
proxy.ts                # Route protection middleware
```

## oRPC Pattern (Type-Safe API)

This project uses **oRPC** instead of traditional REST or tRPC. All API procedures are defined in `lib/router.ts`.

### Adding a New API Procedure

1. **Define the procedure** in `lib/router.ts`:
```typescript
import { os } from "@orpc/server";
import { z } from "zod";

const myProcedure = os
  .input(z.object({ id: z.string() }))
  .output(z.object({ data: z.string() }))
  .route({ method: "GET", path: "/my-endpoint" })  // Creates REST route
  .handler(async ({ input }) => {
    // Your logic here
    return { data: "result" };
  });

export const router = os.router({
  hello,
  myProcedure,  // Add to router
});
```

2. **Use in components** via the client:
```typescript
import { client } from "@/lib/orpc";

// In a component
const result = await client.myProcedure({ id: "123" });
```

3. **Access as REST**: Automatically available at `/rpc/my-endpoint` (GET)

### oRPC Handler Flow
The handler in `app/rpc/[[...rest]]/route.ts` tries OpenAPI (REST) first, then falls back to RPC. This dual-handler pattern means procedures can be called via:
- **REST**: `GET /rpc/hello?name=World`
- **RPC**: `POST /rpc` with procedure call

## Database Access

### MongoDB Setup
MongoDB client is initialized in `lib/mongodb.ts` with singleton pattern (global in dev, fresh in prod).

**Required Environment Variable**: `MONGODB_URI` (add to `.env`)

### Using MongoDB
```typescript
import clientPromise from "@/lib/mongodb";

const client = await clientPromise;
const db = client.db("game-aggregator");
const collection = db.collection("your-collection");
```

## Authentication & Authorization

### Better Auth with RBAC
This project uses Better Auth for authentication with role-based access control.

**Auth Configuration**: `lib/auth.ts`
**Client Setup**: `lib/auth-client.ts`
**API Routes**: `app/api/auth/[...all]/route.ts`

### Authentication Methods
1. **Email & Password**: Traditional email/password authentication
2. **Email OTP**: Passwordless authentication with 6-digit OTP codes
3. **Google OAuth**: Sign in with Google account

### Email Integration
The app uses **Nodemailer** to send emails via SMTP. See [NODEMAILER_SETUP_GUIDE.md](NODEMAILER_SETUP_GUIDE.md) for configuration.

**Email Templates** (in `lib/email/templates.ts`):
- Sign-in OTP emails
- Email verification
- Password reset
- Welcome emails (after signup)
- Security alerts

All templates use a dark theme with gradient accents matching the app design.

### Roles
- **user**: Default role for new users
- **admin**: Full administrative access
- **super-admin**: Highest privilege level

### Protected Routes
The `proxy.ts` middleware protects:
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires admin role
- Redirects authenticated users away from `/sign-in` and `/sign-up`

### Using Authentication in Components

**Client-side** (use `"use client"` directive):
```typescript
import { authClient, useSession } from "@/lib/auth-client";

// Get session
const { data: session } = useSession();

// Sign in
await authClient.signIn.email({ email, password });

// Sign up
await authClient.signUp.email({ email, password, name });

// Sign out
await authClient.signOut();
```

**Server-side** (Server Components/Actions):
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});

if (!session) {
  redirect("/sign-in");
}

// Check role
const isAdmin = session.user.role === "admin" || session.user.role === "super-admin";
```

### Admin Operations
The admin plugin provides these operations (client-side):
```typescript
// Change user role
await authClient.admin.setRole({ userId, role: "admin" });

// Ban user
await authClient.admin.banUser({ userId, banReason: "..." });

// Unban user
await authClient.admin.unbanUser({ userId });

// Delete user
await authClient.admin.removeUser({ userId });

// Impersonate user (for debugging)
await authClient.admin.impersonateUser({ userId });
```

### Database Schema
Better Auth adds these tables to MongoDB:
- **user**: id, name, email, emailVerified, image, role, banned, banReason, banExpires
- **session**: id, userId, expiresAt, ipAddress, userAgent, impersonatedBy
- **account**: OAuth account linking

## Environment Variables

Environment variables are validated via `env.ts` using `@t3-oss/env-nextjs` and Zod.

### Required Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/game-aggregator
MONGODB_DB_NAME=game-aggregator

# Authentication
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SMTP (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Game Aggregator

# Environment
NODE_ENV=development
```

**Generate auth secret**: `openssl rand -base64 32`

**Email Setup**: See [NODEMAILER_SETUP_GUIDE.md](NODEMAILER_SETUP_GUIDE.md) for configuring Gmail, SendGrid, Mailgun, AWS SES, or other SMTP providers.

### Adding New Variables
1. Add schema to `env.ts`:
```typescript
export const env = createEnv({
  server: {
    MONGODB_URI: z.string().min(1).max(2000),
    BETTER_AUTH_SECRET: z.string().min(32),
    NEW_VAR: z.string(),  // Add here
  },
  client: {
    // NEXT_PUBLIC_* vars go here
  },
  runtimeEnv: {
    MONGODB_URI: process.env.MONGODB_URI,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    NEW_VAR: process.env.NEW_VAR,  // Add here
  },
});
```

2. Add to `.env` file
3. Import: `import { env } from "@/env"`

## UI Components

This project uses **shadcn/ui** (New York style) with Radix UI primitives.

### Adding UI Components
```bash
npx shadcn@latest add <component-name>
```

Components are added to `components/ui/`. Configuration is in `components.json`.

### Theming
- Uses `next-themes` for dark/light mode
- Theme provider in `components/theme-provider.tsx`
- CSS variables defined in `app/globals.css`

## Game Components

Games are located in `components/games/`:
- **rock-paper-scissor**: Turn-based game with dialog UI
- **showdown**: Canvas-based 2D game with Algorand staking integration

### Canvas Game Pattern (Showdown)
The Quick Draw Showdown game uses HTML5 Canvas with:
- Game loop with requestAnimationFrame
- State machine: waiting → ready → countdown → fire → result → staking
- Keyboard controls (Press A to shoot)
- Toast notifications (Sonner)

When creating new canvas games, follow this pattern for consistent performance.

## State Management

- **Server State**: Use React Query (`@tanstack/react-query`)
- **Forms**: Use React Hook Form or TanStack React Form
- **URL State**: Use nuqs for query parameters
- **Theme**: Use `useTheme` from next-themes
- **Client State**: useState or React Context

## Code Style & Conventions

### Component Structure
- Use `"use client"` directive for interactive components
- Server components by default (Next.js App Router)
- Co-locate game logic with components when possible

### Import Aliases
- `@/` maps to root directory
- Example: `import { client } from "@/lib/orpc"`

### Styling
- Use Tailwind utility classes
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Prefer shadcn/ui components over custom UI code

## Testing & Building

### Pre-deployment Checklist
1. Copy `.env.example` to `.env` and fill in values
2. Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`
3. Configure SMTP credentials (see [NODEMAILER_SETUP_GUIDE.md](NODEMAILER_SETUP_GUIDE.md))
4. Set up Google OAuth credentials (see `.env.example`)
5. Run `bun lint` to check for errors
6. Run `bun build` to verify production build
7. Check API documentation at `/api` works correctly
8. Verify all game mechanics function properly
9. Test authentication flows (email/password, OTP, Google OAuth)
10. Test email sending (sign-up verification, password reset, OTP)
11. Verify admin panel access control

## Common Patterns

### Adding a New Game
1. Create component in `components/games/<game-name>/index.tsx`
2. Add game state management (local state or React Query)
3. Add UI using shadcn/ui components
4. If blockchain integration needed, add contract interaction logic
5. Add toast notifications for user feedback (Sonner)

### Accessing MongoDB in API Routes
```typescript
// In lib/router.ts procedure handler
import clientPromise from "@/lib/mongodb";

const handler = async ({ input }) => {
  const client = await clientPromise;
  const db = client.db("game-aggregator");
  // Use db...
};
```

### Type Safety
- All API inputs/outputs validated with Zod schemas
- Router type exported: `export type Router = typeof router`
- Client automatically infers types from router

## Deployment

This is a standard Next.js application deployable to:
- **Vercel** (recommended, zero-config)
- Any platform supporting Node.js 18+

Ensure all environment variables are set:
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name
- `BETTER_AUTH_SECRET` - Minimum 32 characters (use `openssl rand -base64 32`)
- `BETTER_AUTH_URL` - Your production URL (e.g., https://yourdomain.com)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `SMTP_*` - Email server credentials (see [NODEMAILER_SETUP_GUIDE.md](NODEMAILER_SETUP_GUIDE.md))
- `NODE_ENV` - Set to `production`

**Important for Production**:
- Set `requireEmailVerification: true` in [lib/auth.ts:16](lib/auth.ts#L16)
- Use a reliable SMTP provider (SendGrid, AWS SES, Mailgun) instead of Gmail
- Set up SPF, DKIM, and DMARC records for your email domain

## Admin Panel Features

The admin panel at `/admin` provides:
- **User Management**: View all users with sorting and filtering
- **Role Assignment**: Change user roles (user, admin, super-admin)
- **User Banning**: Ban/unban users with optional reasons
- **User Deletion**: Permanently remove user accounts
- **Session Management**: View and manage user sessions
- **Real-time Updates**: Refresh user list to see latest changes

Access is restricted to users with `admin` or `super-admin` roles.
