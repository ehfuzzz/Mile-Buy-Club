# Placeholder & TODO Inventory

This audit lists the remaining placeholder implementations, mock data, and TODO markers across the Mile Buy Club repo so they can be triaged and scheduled for completion.

## Backend (apps/api)

- `apps/api/src/affiliate/affiliate.service.ts`
  - Stubbed Prisma calls for clicks, conversions, and reports are marked with TODOs and return mock arrays instead of database results.
  - Notification hooks for affiliate conversions are placeholder implementations that only log actions.
- `apps/api/src/affiliate/attribution.service.ts`
  - Attribution lookups still return hard-coded responses; TODO markers cover pending Prisma queries and email-based matching logic.
  - Aggregation helpers expose TODOs for future reporting queries.
- `apps/api/src/affiliate/reporting.service.ts`
  - Revenue and partner reporting endpoints respond with synthesized data pending real Prisma aggregations.
- `apps/api/src/affiliate/link-generator.ts`
  - Link shortener integration is left as a TODO with a mocked URL response.
- `apps/api/src/cards/cards.service.ts`
  - Credit-card catalog endpoints deliver mocked benefits and require database-backed implementations.
- `apps/api/src/health/health.controller.ts`
  - Redis and provider health checks are still TODOs, so only basic responses are returned.
- `apps/api/src/users/users.service.ts`
  - Password hashing is marked TODO; the service currently returns the plain-text password parameter.
- `apps/api/src/jobs/alert-digest.processor.ts`
  - Database queries, email templating, and notification delivery remain TODOs with placeholder arrays/log statements.
- `apps/api/src/jobs/deal-cleanup.processor.ts`
  - Expired-deal deletion is mocked; a TODO highlights the missing Prisma delete call.
- `apps/api/src/jobs/scheduler.service.ts`
  - Watcher metadata loading, watcher type/search params, and digest audience queries rely on placeholder values and TODO notes.
- `apps/api/src/auth/strategies/jwt.strategy.ts`
  - User existence check is a TODO; the guard trusts tokens without verifying stored users.
- `apps/api/src/auth/strategies/jwt-refresh.strategy.ts`
  - Refresh-token revocation checks are TODO placeholders returning the JWT payload directly.

## Frontend (apps/web)

- `apps/web/app/(dashboard)/activities/page.tsx`
  - Activity listings use hard-coded demo data with a TODO to replace it with real API calls.
- `apps/web/app/(dashboard)/hotels/page.tsx`
  - Hotel search results are mocked; TODO comments note that live API integration is pending.

## Documentation & Project Tracking

- `TODO.md`, `README_TODO_SYSTEM.md`, and related onboarding docs reference outstanding TODO placeholders to guide future work.
- Progress trackers (`FINAL_REPORT.txt`, `PROGRESS_SUMMARY.md`, and `SONNET_TASK_4_VERIFICATION.md`) still flag several subsystems (database integration, email service) as TODO-linked follow-ups.

## Environment & Configuration

- `.env.example` retains placeholder API keys and OAuth credentials that must be swapped with real secrets during deployment.

These areas should be prioritized when planning the next development sprint so the remaining placeholders can be replaced with production-ready implementations.
