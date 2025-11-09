# Game Aggregator - Algorand Gaming Platform

A modern blockchain-based gaming platform built on Algorand with integrated authentication, role-based access control (RBAC), and beautiful UI components.

## Features

- 🎮 **Gaming Platform** - Multiple blockchain-integrated games
- 🔐 **Authentication** - Secure email/password auth with Better Auth
- 👥 **RBAC** - Role-based access control (user, admin, super-admin)
- 🎨 **Beautiful UI** - Built with shadcn/ui and Tailwind CSS v4
- 🛡️ **Admin Panel** - Complete user management interface
- ⚡ **Type-Safe** - End-to-end TypeScript with oRPC
- 🗄️ **MongoDB** - Scalable database integration

## Quick Start

**Just want to get started?** Follow [QUICKSTART.md](QUICKSTART.md) - setup in 5 minutes!

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- MongoDB (local or cloud)
- OpenSSL (for generating secrets)

### Installation

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Generate auth secret
openssl rand -base64 32
# Copy the output to .env as BETTER_AUTH_SECRET
```

### Configuration

Edit `.env` with your values:

```env
MONGODB_URI=mongodb://localhost:27017/game-aggregator
BETTER_AUTH_SECRET=<your-generated-secret>
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

### Run Development Server

```bash
# Start MongoDB (if not running)
mongod

# Start Next.js dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Create Admin User

1. Sign up at http://localhost:3000/sign-up
2. Connect to MongoDB and promote yourself:

```bash
mongosh
use game-aggregator
db.user.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

3. Access admin panel at http://localhost:3000/admin

## Documentation

- 📚 **[QUICKSTART.md](QUICKSTART.md)** - Get up and running in 5 minutes
- 📚 **[AUTH_SETUP.md](AUTH_SETUP.md)** - Complete authentication guide
- 📚 **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was built
- 📚 **[CLAUDE.md](CLAUDE.md)** - Architecture and development guide

## Tech Stack

- **Frontend**: React 19, Next.js 16 (App Router), TypeScript
- **Authentication**: Better Auth with RBAC
- **Database**: MongoDB
- **UI**: shadcn/ui, Tailwind CSS v4, Radix UI
- **API**: oRPC (type-safe RPC with OpenAPI)
- **State**: React Query, React Hook Form
- **AI**: Google Gemini (Vercel AI SDK)

## Project Structure

```
├── app/
│   ├── (auth)/          # Sign in/up pages
│   ├── dashboard/       # User dashboard
│   ├── admin/           # Admin panel
│   └── api/             # API routes
├── components/
│   ├── auth/            # Auth components
│   ├── admin/           # Admin components
│   ├── games/           # Game components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── auth.ts          # Auth configuration
│   ├── auth-client.ts   # Client auth
│   └── router.ts        # API routes (oRPC)
└── proxy.ts             # Route protection
```

## Available Scripts

```bash
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page with games |
| `/sign-up` | Public | User registration |
| `/sign-in` | Public | User login |
| `/dashboard` | Authenticated | User dashboard |
| `/admin` | Admin only | Admin panel |
| `/api` | Public | Interactive API docs |

## Games

- **Rock Paper Scissors** - Turn-based classic game
- **Quick Draw Showdown** - Real-time Western duel with Algorand staking

## Admin Features

The admin panel provides:
- View all users with roles and status
- Change user roles (user/admin/super-admin)
- Ban/unban users with reasons
- Delete user accounts
- Session management
- Real-time updates

## Development

### Adding API Routes

Define procedures in `lib/router.ts`:

```typescript
import { os } from "@orpc/server";
import { z } from "zod";

const myProcedure = os
  .input(z.object({ id: z.string() }))
  .output(z.object({ data: z.string() }))
  .route({ method: "GET", path: "/my-endpoint" })
  .handler(async ({ input }) => {
    return { data: "result" };
  });
```

### Adding UI Components

```bash
npx shadcn@latest add <component-name>
```

### Database Access

```typescript
import clientPromise from "@/lib/mongodb";

const client = await clientPromise;
const db = client.db("game-aggregator");
const collection = db.collection("users");
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure environment variables are set:
- `MONGODB_URI`
- `BETTER_AUTH_SECRET` (min 32 characters)
- `BETTER_AUTH_URL` (your production URL)
- `NODE_ENV=production`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [oRPC Documentation](https://orpc.netlify.app)
- [MongoDB Documentation](https://www.mongodb.com/docs)

## License

This project is MIT licensed.
