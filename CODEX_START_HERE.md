# Codex Parallelization Guide — Mile Buy Club

Welcome! This document gives you focused prompts, context, and acceptance criteria so you can work in parallel with the existing build.

## Project Snapshot
- Monorepo: Turborepo with `apps/web` (Next.js 14) and `apps/api` (NestJS)
- Database: Prisma (PostgreSQL) — schema + seed ready
- Providers: Rate-limited abstraction layer (bottleneck, retries, health checks)
- Jobs: BullMQ queues (watcher, cleanup, digests) with scheduler
- Status: Foundation complete; working on Phase 3 (Auth, Notifications UI, PWA, Ranking integration)

## Conventions
- TypeScript strict mode everywhere.
- Keep secrets out of repo. Use `.env.local.example` for frontend and `apps/api/.env.example` for backend.
- Small, focused PRs per batch below.

---

## Batch A — PWA Setup (Independent, quick)

### Your Tasks (Codex)
1) Create app manifest
- File: `apps/web/app/manifest.ts`
- Include: name "Mile Buy Club", short_name "MBC", description, theme_color, background_color, display "standalone", start_url "/", icons 192/512

2) Add icons
- Files: `apps/web/public/icons/icon-192.png`, `apps/web/public/icons/icon-512.png`, `apps/web/public/icons/apple-touch-icon.png`
- Use placeholders (solid color is fine). Keep sizes exact.

3) Service Worker
- File: `apps/web/public/sw.js`
- Cache strategy: cache-first for static, network-first for dynamic
- Offline fallback route: show `OfflineFallback` page placeholder
- Background sync for failed requests (register event handler stub)

4) Next config/layout wiring
- Add `<link rel="manifest" href="/manifest.webmanifest"/>` if using conventional filename, or programmatic Next 14 `app/manifest.ts` export
- Add theme-color meta + apple-touch-icon links in `app/layout.tsx`

### Acceptance Criteria
- Lighthouse PWA checks pass locally (installable)
- Offline returns the fallback page
- No runtime errors in production build

---

## Batch B — Authentication (NextAuth)

### Your Tasks (Codex)
1) Route handler (NextAuth)
- File: `apps/web/app/api/auth/[...nextauth]/route.ts`
- Providers: Google OAuth (placeholders for client id/secret), Credentials (email/password)
- JWT strategy with callbacks: enrich token with `id` and `email` if present
- Session callback: attach `user.id`, `user.email` to session

2) Helper utilities
- File: `apps/web/lib/auth.ts`
- Exports: `authOptions`, `getServerSession`, `requireAuth`

3) Middleware for protected routes
- File: `apps/web/middleware.ts`
- Protect `/dashboard/*`; redirect to `/login` if not authenticated

### Acceptance Criteria
- `/api/auth/signin` renders with Google + credentials
- Session includes `user.id` and `user.email`
- Visiting `/dashboard` unauthenticated redirects to `/login`

---

## Batch C — Notifications (Frontend Client SDK)

### Your Tasks (Codex)
1) Client SDK
- File: `apps/web/lib/notifications/client.ts`
- Exports: `requestPermission()`, `registerServiceWorker()`, `subscribeToPush()`, `unsubscribeFromPush()`, `getUnreadCount()`, `markAllRead()`
- Store unread count locally; return mock values for now

2) API client
- File: `apps/web/lib/notifications/api.ts`
- Endpoints (stubs ok): `POST /api/notifications/subscribe`, `POST /api/notifications/unsubscribe`, `POST /api/notifications/mark-read`

3) Types
- File: `apps/web/lib/notifications/types.ts`
- `NotificationItem` { id, title, body, createdAt, read }

### Acceptance Criteria
- Importable hooks/functions with no runtime errors
- Unit-testable functions (pure logic)
- Works with placeholder UI (bell dropdown, notification center)

---

## Batch D — Ranking (UI Adapter)

### Your Tasks (Codex)
1) Ranking Preview Adapter
- File: `apps/web/lib/ranking-preview.ts`
- Export: `computeUiScore(deal)` — deterministic function mapping deal fields to a 0–100 score (align with back-end later)
- Inputs: { price, cpp, milesRequired, cabin, airline, createdAt }
- Rationale: docstring explaining the simple scoring (e.g., lower price/higher cpp → higher score)

### Acceptance Criteria
- Returned score is stable and monotonic by price/cpp
- Unit-testable functional module
- Drop-in usable by UI (e.g., score badge)

---

## Helpful Paths & Commands
- Web dev: `npm run dev` (Next.js)
- API dev: `npm run dev` (NestJS)
- DB push: `npm run db:push` from `packages/database`
- Seed: `npm run prisma:seed` from `packages/database`
- Swagger: `http://localhost:3001/api/docs`

## Integration Notes
- UI (Haiku) will use your stubs immediately and swap to real APIs later.
- Keep function signatures stable; evolving implementations behind them is fine.
- Prefer small, isolated commits per file for easy review.

## Hand-off Prompts (Copy-Paste)

### PWA Setup (Batch A)
"""
Implement PWA basics:
- apps/web/app/manifest.ts with required fields
- Add icons (192, 512, apple-touch) in public/icons
- Create public/sw.js with cache-first for static and offline fallback
- Wire manifest + theme-color in app/layout.tsx
Return: the new/changed files only.
"""

### NextAuth (Batch B)
"""
Add NextAuth route handler with Google + Credentials providers:
- apps/web/app/api/auth/[...nextauth]/route.ts (JWT, callbacks, error handling)
- apps/web/lib/auth.ts (authOptions, getServerSession, requireAuth)
- apps/web/middleware.ts (protect /dashboard/*)
Return: the new/changed files only.
"""

### Notifications Client (Batch C)
"""
Implement notifications client SDK:
- apps/web/lib/notifications/client.ts with functions to request permission, register SW, subscribe/unsubscribe, unread helpers
- apps/web/lib/notifications/api.ts stubs for subscribe/unsubscribe/mark-read
- apps/web/lib/notifications/types.ts for NotificationItem
Return: the new/changed files only.
"""

### Ranking Adapter (Batch D)
"""
Create ranking preview adapter:
- apps/web/lib/ranking-preview.ts exporting computeUiScore(deal)
- Document scoring rules in comments
Return: the new/changed files only.
"""

