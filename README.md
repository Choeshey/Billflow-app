# SaaSApp — Full-Stack Next.js + Prisma Dashboard

Production-grade SaaS with auth, clients, invoices, subscriptions, and settings.

## Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL via Prisma |
| Auth | JWT (jose) + httpOnly cookies |
| Passwords | bcryptjs (12 rounds) |
| Styling | Tailwind CSS v4 |

---

## Quick Start

```bash
# 1 — Copy env and fill in your DATABASE_URL
cp .env.example .env

# 2 — Install dependencies
npm install

# 3 — Generate Prisma client
npm run db:generate

# 4 — Push schema to your database
npm run db:push

# 5 — Seed demo data
npm run db:seed

# 6 — Start dev server
npm run dev
```

**Demo login:** `demo@acme.com` / `password123`

---

## All Pages & Routes

### Public
| Route | Description |
|---|---|
| `/login` | Sign in |
| `/register` | Create account |

### Dashboard (auth required)
| Route | Description |
|---|---|
| `/dashboard` | Overview: stats + recent invoices |
| `/dashboard/clients` | List + search + delete |
| `/dashboard/clients/new` | Create client |
| `/dashboard/clients/[id]` | Edit client + view their invoices |
| `/dashboard/invoices` | List + filter by status + delete |
| `/dashboard/invoices/new` | Create invoice |
| `/dashboard/invoices/[id]` | View + update status + delete |
| `/dashboard/settings` | Update profile + change password |
| `/dashboard/subscription` | Current plan + upgrade |

### API Routes
| Method + Path | Description |
|---|---|
| `POST /api/auth/register` | Create account → sets cookie |
| `POST /api/auth/login` | Login → sets cookie |
| `POST /api/auth/logout` | Clears cookie |
| `GET /api/auth/me` | Current user |
| `PATCH /api/auth/me` | Update profile / password |
| `GET /api/clients` | List clients |
| `POST /api/clients` | Create client |
| `GET /api/clients/[id]` | Get client |
| `PATCH /api/clients/[id]` | Update client |
| `DELETE /api/clients/[id]` | Delete client (cascades invoices) |
| `GET /api/invoices` | List invoices |
| `POST /api/invoices` | Create invoice |
| `GET /api/invoices/[id]` | Get invoice |
| `PATCH /api/invoices/[id]` | Update invoice |
| `DELETE /api/invoices/[id]` | Delete invoice |
| `GET /api/stats` | Dashboard metrics |
| `GET /api/subscription` | Current subscription |

---

## Architecture

```
src/
├── app/                   Next.js App Router pages + API routes
├── components/ui/         Button · Input · Select · Textarea · Card · Badge · Spinner · Modal
├── components/layout/     Sidebar · Header (all nav links active)
├── hooks/                 useAuth · useClients · useInvoices
├── services/              authService · clientService · invoiceService · statsService
├── lib/                   prisma.ts · auth.ts · types.ts · utils.ts
└── context/               AuthContext (JWT cookie session)
```

### Auth flow
1. Login → `POST /api/auth/login` → sets `auth-token` httpOnly cookie
2. Middleware checks cookie on every `/dashboard/**` request
3. `AuthContext` calls `GET /api/auth/me` on mount to hydrate user state
4. Logout → `POST /api/auth/logout` → clears cookie → redirect `/login`

### Data flow
```
UI Component → useHook → service function → Prisma → PostgreSQL
```
No direct `fetch()` calls in UI components — all data goes through hooks.
# Billflow-app
# Billflow-app
