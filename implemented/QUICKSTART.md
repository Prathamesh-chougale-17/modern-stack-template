# Quick Start Guide

Get your RBAC authentication system running in 5 minutes!

## Prerequisites

- Bun installed
- MongoDB installed and running
- OpenSSL (for generating secrets)

## 5-Minute Setup

### 1. Install Dependencies (30 seconds)

```bash
bun install
```

### 2. Configure Environment (1 minute)

```bash
# Copy template
cp .env.example .env

# Generate secret and copy output
openssl rand -base64 32
```

Update `.env` with the generated secret:

```env
MONGODB_URI=mongodb://localhost:27017/game-aggregator
BETTER_AUTH_SECRET=<paste-your-generated-secret-here>
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start MongoDB (if not running)

```bash
# Option 1: Direct
mongod

# Option 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start Development Server (30 seconds)

```bash
bun dev
```

Visit: http://localhost:3000

### 5. Create Your Account (1 minute)

1. Click "Sign Up" or visit: http://localhost:3000/sign-up
2. Fill in:
   - Name: `Admin User`
   - Email: `admin@example.com`
   - Password: `password123` (min 8 characters)
3. Submit

### 6. Make Yourself Admin (1 minute)

Open a new terminal:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use game-aggregator

# Make your user an admin
db.user.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)

# Verify
db.user.findOne({ email: "admin@example.com" })
```

### 7. Access Admin Panel (30 seconds)

1. Refresh your browser or sign out and back in
2. Go to Dashboard: http://localhost:3000/dashboard
3. You'll see an "Admin Panel" card with amber accent
4. Click "Open Admin" button
5. Or directly visit: http://localhost:3000/admin

## You're Done!

Now you can:
- ✅ Manage users
- ✅ Change roles
- ✅ Ban/unban users
- ✅ Delete users
- ✅ View sessions

## Quick Test

### Create a Test User

1. Sign out (click "Sign Out" button)
2. Go to http://localhost:3000/sign-up
3. Create a second user:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Sign out

### Manage the Test User as Admin

1. Sign in as admin (`admin@example.com`)
2. Go to `/admin`
3. Find "Test User" in the table
4. Click the three-dot menu
5. Try actions:
   - Change Role → Make them admin
   - Ban User → Add a reason
   - Unban User → Remove ban
   - Delete User → Permanently remove

## Routes Overview

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/sign-up` | Public | Registration |
| `/sign-in` | Public | Login |
| `/dashboard` | User+ | User dashboard |
| `/admin` | Admin+ | Admin panel |
| `/api/auth/*` | Public | Auth endpoints |

## Common Commands

```bash
# Start dev server
bun dev

# Build for production
bun build

# Run production server
bun start

# Lint code
bun lint

# View API docs
# Visit: http://localhost:3000/api
```

## Architecture at a Glance

```
Frontend (React + Next.js)
    ↓
Better Auth Client (lib/auth-client.ts)
    ↓
API Routes (app/api/auth/[...all])
    ↓
Better Auth Server (lib/auth.ts)
    ↓
MongoDB (user, session collections)
    ↓
Middleware Protection (proxy.ts)
```

## File Structure

```
📁 Project Root
├── 📄 .env (your secrets - never commit!)
├── 📄 .env.example (template)
├── 📄 proxy.ts (route protection)
│
├── 📁 lib/
│   ├── auth.ts (server auth config)
│   └── auth-client.ts (client auth)
│
├── 📁 app/
│   ├── 📁 (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── dashboard/page.tsx
│   ├── admin/page.tsx
│   └── 📁 api/
│       └── auth/[...all]/route.ts
│
└── 📁 components/
    ├── 📁 auth/
    │   └── sign-out-button.tsx
    └── 📁 admin/
        ├── admin-header.tsx
        ├── user-management.tsx
        └── user-actions.tsx
```

## Troubleshooting

### Can't connect to MongoDB?
```bash
# Check if MongoDB is running
mongosh

# If not, start it
mongod
```

### Environment errors?
- Restart dev server after changing `.env`
- Verify secret is at least 32 characters
- Check all variables are set

### Can't access admin panel?
```bash
# Verify your role
mongosh
use game-aggregator
db.user.findOne({ email: "your@email.com" })

# If role is not "admin", update it
db.user.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### Need to reset everything?
```bash
# Drop database and start fresh
mongosh
use game-aggregator
db.dropDatabase()

# Then restart dev server and sign up again
```

## Next Steps

Read the detailed guides:
- 📚 [AUTH_SETUP.md](AUTH_SETUP.md) - Complete auth documentation
- 📚 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - What was built
- 📚 [CLAUDE.md](CLAUDE.md) - Project architecture

## Getting Help

If you run into issues:
1. Check the troubleshooting section above
2. Read [AUTH_SETUP.md](AUTH_SETUP.md) for detailed info
3. Check Better Auth docs: https://www.better-auth.com
4. Verify MongoDB is running and accessible

---

**That's it!** You now have a production-ready authentication system with RBAC. 🎉
