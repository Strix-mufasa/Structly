# Structly — Time Registration PWA

A minimal, mobile-first time registration app built with Next.js 14, Prisma, Neon, and NextAuth.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth v5 (JWT) |
| ORM | Prisma |
| Database | Neon (Postgres) |
| Email | Resend |
| Deploy | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, Set Password, Forgot/Reset Password
│   ├── (admin)/             # Admin panel — Dashboard, Users, Tasks, Entries
│   ├── (employee)/          # Employee PWA — Dashboard, Log Time, Week, History
│   └── api/
│       ├── auth/            # NextAuth + custom auth endpoints
│       ├── admin/           # Admin-only API routes
│       ├── entries/         # Employee time entries
│       └── tasks/           # Active tasks for employee dropdown
├── components/
│   ├── ui/                  # Base components (Button, Input, Card, etc.)
│   ├── admin/               # Admin-specific components
│   ├── employee/            # Employee-specific components
│   └── shared/              # Shared across both zones
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── prisma.ts            # Prisma client singleton
│   ├── email.ts             # Resend email functions
│   ├── utils.ts             # Helpers
│   └── api-guard.ts         # Auth middleware for API routes
└── types/
    └── index.ts             # Shared TypeScript types
```

---

## Setup — Step by Step

### 1. Clone and install

```bash
git clone <your-repo-url>
cd structly
npm install
```

### 2. Create your Neon database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project — name it `structly`
3. Copy the **Connection string** (it looks like `postgresql://...`)
4. Keep this tab open — you need it in step 4

### 3. Create your Resend account

1. Go to [resend.com](https://resend.com) and sign up
2. Create an API key — copy it
3. Add and verify your sending domain (or use the Resend sandbox for testing)

### 4. Set up environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
# From Neon dashboard
DATABASE_URL="postgresql://..."

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# From Resend dashboard
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="Structly <noreply@yourdomain.com>"

# For local dev
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Push the database schema

```bash
npx prisma generate
npx prisma db push
```

### 6. Seed with test data (optional but recommended)

```bash
npm run db:seed
```

This creates:
- **Admin:** `admin@structly.com` / `admin123`
- **Employee:** `anna@structly.com` / `employee123`
- 8 sample tasks

### 7. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Screen Reference

| Screen ID | URL | Who sees it |
|---|---|---|
| AUTH-01 | `/auth/login` | Everyone |
| AUTH-02 | `/auth/set-password?token=...` | Invited users |
| AUTH-03 | `/auth/forgot-password` | Everyone |
| AUTH-04 | `/auth/reset-password?token=...` | Everyone |
| ADM-01 | `/admin/dashboard` | Admin |
| ADM-02 | `/admin/users` | Admin |
| ADM-03 | `/admin/users/new` | Admin |
| ADM-04 | `/admin/users/[id]` | Admin |
| ADM-05 | `/admin/tasks` | Admin |
| ADM-08 | `/admin/entries` | Admin |
| EMP-01 | `/app/dashboard` | Employee |
| EMP-02 | `/app/log` | Employee |
| EMP-03 | `/app/week` | Employee |
| EMP-04 | `/app/history` | Employee |

---

## API Routes

### Auth (Public)
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/[...nextauth]` | NextAuth handler |
| GET | `/api/auth/me` | Get current user + role |
| GET | `/api/auth/verify-token` | Validate invite/reset token |
| POST | `/api/auth/set-password` | Activate account via invite |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password via token |

### Admin (requires Admin JWT)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard summary cards |
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user + send invite |
| GET/PATCH/DELETE | `/api/admin/users/[id]` | Get, update, or delete user |
| GET | `/api/admin/tasks` | List all tasks |
| POST | `/api/admin/tasks` | Create task |
| PATCH | `/api/admin/tasks/[id]` | Update task name or status |
| GET | `/api/admin/entries` | All entries (filterable) |

### Employee (requires Employee JWT)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/tasks` | Active tasks for dropdown |
| GET | `/api/entries` | Own entries (date/week filters) |
| POST | `/api/entries` | Create a new time entry |

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Add all environment variables from `.env.local`
   - Change `NEXTAUTH_URL` to your Vercel URL (e.g. `https://structly.vercel.app`)
   - Change `NEXT_PUBLIC_APP_URL` to the same Vercel URL
4. Deploy

### 3. Run migrations on Neon (already done via `db push`)

Neon's hosted Postgres is already connected. Nothing extra needed.

### 4. Seed production (optional)

Run this once locally with your production `DATABASE_URL`:

```bash
DATABASE_URL="your-neon-production-url" npm run db:seed
```

---

## PWA Installation

On **iOS Safari:** Share → Add to Home Screen  
On **Android Chrome:** Menu → Add to Home Screen (or the install prompt)

The app uses:
- `manifest.json` for PWA metadata
- `theme-color` meta tag for browser chrome colour
- `apple-touch-icon` for iOS home screen

> **Note for Raj:** Drop the PWA icons into `public/icons/`:
> - `icon-192.png` (192×192)
> - `icon-512.png` (512×512)

---

## QA Checklist

### Auth
- [ ] Login with correct credentials → redirects by role
- [ ] Login with wrong password → inline error shown
- [ ] Disabled account → specific error message
- [ ] Invite link → set password → account activated → login works
- [ ] Expired invite link → correct error screen shown
- [ ] Forgot password → email received → reset link works
- [ ] Reset link used once → second attempt shows expired

### Admin
- [ ] Create user → invite email received
- [ ] Edit user name and role → changes saved
- [ ] Disable user → they can no longer log in
- [ ] Enable user → they can log in again
- [ ] Create task → appears in employee dropdown immediately
- [ ] Deactivate task → disappears from employee dropdown
- [ ] Edit task name → historical entries unaffected
- [ ] Time entries table shows all users' entries

### Employee
- [ ] Dashboard shows today's hours and entries
- [ ] Log Time: all fields validate correctly
- [ ] Hours > 24 → error shown
- [ ] Future date → blocked
- [ ] Inactive task → not in dropdown
- [ ] Success toast appears after save
- [ ] Weekly view shows correct totals per day
- [ ] Week navigation (prev/next) works
- [ ] History shows all entries grouped by date
- [ ] PWA installable on iOS Safari
- [ ] PWA installable on Android Chrome

### General
- [ ] Employee cannot access `/admin/*` routes
- [ ] Admin cannot access `/app/*` routes
- [ ] Unauthenticated user redirected to login
- [ ] Works on mobile viewport (375px)
- [ ] Works on desktop viewport (1280px)

---

## Notes for Raj (Design Handoff)

- All Screen IDs match Figma frame names from the IA document
- Brand colour: `#4361EE` (Tailwind: `brand`)
- Success: `#06D6A0` · Error: `#EF233C` · Warning: `#F4A261`
- Border radius: `0.75rem` (12px) for cards, `0.5rem` (8px) for badges
- Font: Inter (loaded via `next/font/google`)
- Touch targets: minimum `48px` height on all interactive elements
- Bottom tab bar height: `64px` + safe area inset

---

## Common Issues

**Prisma client not found:**
```bash
npx prisma generate
```

**Email not sending locally:**
Use Resend's sandbox mode — set `RESEND_FROM_EMAIL` to `onboarding@resend.dev` for testing.

**Neon connection timeout:**
Add `?sslmode=require&connect_timeout=10` to your `DATABASE_URL`.

**NextAuth session undefined:**
Make sure `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches your actual URL exactly.
