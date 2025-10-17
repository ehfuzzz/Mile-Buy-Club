# Mile Buy Club - Complete Implementation Checklist

**Legend**: 🟣 Haiku 4.5 | 🔴 Sonnet 4 (Complex) | 🟡 ChatGPT Codex (Parallel) | ✅ Already Complete

---

## STATUS OVERVIEW

- **Phase 1**: Foundation & Config - 0% Complete
- **Phase 2**: Backend Infrastructure - 0% Complete  
- **Phase 3**: Frontend Architecture & Auth - 0% Complete
- **Phase 4**: User Experience Flows - 0% Complete
- **Phase 5**: Production Readiness - 0% Complete
- **Sonnet Tasks**: 30% Complete (Database + Value Engine built)

---

## PHASE 1: FOUNDATION & CONFIGURATION
**Status**: Pending | **Model**: 🟣 Haiku 4.5 | **Timeline**: 2-3 hours

### PROMPT 1: Monorepo Setup & Package.json Files 🟣
- [ ] Create root `package.json` with Turborepo
- [ ] Create `apps/web/package.json` (Next.js 14 stack)
- [ ] Create `apps/api/package.json` (NestJS stack)
- [ ] Create `packages/database/package.json`
- [ ] Create `packages/shared/package.json`
- [ ] Create `packages/providers/package.json` (new package)
- [ ] Create root `turbo.json` with pipeline configs
- [ ] Create root `.gitignore`
- [ ] Create root `README.md` with quick start
- [ ] Set up npm workspaces linking

### PROMPT 2: TypeScript & Config Files 🟣
- [ ] Create root `tsconfig.json`
- [ ] Create `apps/web/tsconfig.json` (Next.js specific)
- [ ] Create `apps/api/tsconfig.json` (NestJS specific)
- [ ] Create `packages/shared/tsconfig.json`
- [ ] Create `packages/providers/tsconfig.json`
- [ ] Create root `.eslintrc.js` and workspace overrides
- [ ] Create root `.prettierrc` config
- [ ] Create `.editorconfig`

### PROMPT 3: Docker Development Environment 🟣
- [ ] Create `docker-compose.yml` with PostgreSQL, Redis, Mailhog
- [ ] Create `apps/api/Dockerfile` (multi-stage NestJS build)
- [ ] Create `apps/web/Dockerfile` (multi-stage Next.js build)
- [ ] Create root `Makefile` with dev/stop/clean/logs/db-reset commands
- [ ] Create `.env.example` for apps/web
- [ ] Create `.env.example` for apps/api
- [ ] Create `.env.example` for packages/database
- [ ] Test docker-compose up works locally

### PROMPT 4: Prisma Schema Foundation ✅ (Already Built by Sonnet)
**Status**: Complete | **Location**: `packages/database/prisma/schema.prisma`
- ✅ Core User, LoyaltyProgram, UserProgram models
- ✅ CreditCardCatalog, UserCard models
- ✅ 13+ models with proper relationships
- ✅ `packages/database/prisma/seed.ts` with demo data
- ✅ Proper indexes, constraints, soft deletes
- ✅ Package.json scripts (db:generate, db:push, db:migrate, db:studio)

### PROMPT 5: Next.js Frontend Shell 🟣
- [ ] Create `apps/web/app/layout.tsx` with RootLayout
- [ ] Create `apps/web/app/page.tsx` (landing hero page)
- [ ] Create `apps/web/app/globals.css` with Tailwind directives
- [ ] Create `apps/web/tailwind.config.ts`
- [ ] Create `apps/web/lib/utils.ts` with cn() helper
- [ ] Create `apps/web/lib/api.ts` (fetch wrapper)
- [ ] Create `apps/web/components/ui/` folder structure
- [ ] Create `apps/web/components/layout/Header.tsx` (responsive)
- [ ] Create `apps/web/components/layout/Footer.tsx`
- [ ] Create basic responsive styling

---

## PHASE 2: BACKEND INFRASTRUCTURE
**Status**: 30% Complete | **Primary Model**: 🔴 Sonnet 4 | **Timeline**: 4-5 hours

### PROMPT 6: NestJS API Foundation 🟣
- [ ] Create `apps/api/src/main.ts` with bootstrap (CORS, validation, Swagger)
- [ ] Create `apps/api/src/app.module.ts` (root module)
- [ ] Create `apps/api/src/common/prisma/prisma.module.ts`
- [ ] Create `apps/api/src/common/prisma/prisma.service.ts`
- [ ] Create `apps/api/src/common/decorators/` folder structure
- [ ] Create `apps/api/src/common/guards/` folder structure
- [ ] Create `apps/api/src/common/filters/` (exception filters)
- [ ] Create `apps/api/src/common/interceptors/` folder structure
- [ ] Create `apps/api/src/config/config.service.ts` (Zod validation)
- [ ] Create `apps/api/src/health/health.controller.ts` (/health endpoint)
- [ ] Create `apps/api/src/users/` module (CRUD endpoints)

### SONNET TASK 3: Provider Abstraction Layer 🔴
- [ ] Create `packages/providers/src/base/FlightProvider.ts` (abstract base)
- [ ] Create `packages/providers/src/base/HotelProvider.ts`
- [ ] Create `packages/providers/src/base/ActivityProvider.ts`
- [ ] Create `packages/providers/src/base/types.ts` (interfaces)
- [ ] Create `packages/providers/src/flights/` folder with adapters
- [ ] Create `packages/providers/src/hotels/` folder with adapters
- [ ] Create `packages/providers/src/activities/` folder with adapters
- [ ] Create `packages/providers/src/registry.ts` (provider registration)
- [ ] Implement rate limiting in each adapter
- [ ] Implement response normalization

### SONNET TASK 4: Background Job Scheduler 🔴
- [ ] Create `apps/api/src/jobs/queue.module.ts` (BullMQ setup)
- [ ] Create `apps/api/src/jobs/watcher.processor.ts`
- [ ] Create `apps/api/src/jobs/deal-cleanup.processor.ts`
- [ ] Create `apps/api/src/jobs/alert-digest.processor.ts`
- [ ] Create `apps/api/src/jobs/scheduler.service.ts` (cron registration)
- [ ] Implement batch processing and deduplication
- [ ] Implement exponential backoff logic
- [ ] Add comprehensive logging

### SONNET TASK 23: Logging & Monitoring 🔴
- [ ] Create `apps/api/src/common/middleware/logger.middleware.ts`
- [ ] Create `apps/api/src/common/interceptors/logging.interceptor.ts`
- [ ] Create `packages/shared/src/logger.ts` (Winston wrapper)
- [ ] Add /health/live and /health/ready endpoints
- [ ] Create `apps/api/src/metrics/metrics.service.ts` (Prometheus format)
- [ ] Add /metrics endpoint
- [ ] Create `apps/web/lib/client-logger.ts`
- [ ] Update `docker-compose.yml` with Prometheus & Grafana

### SONNET TASK 24: Security Hardening 🔴
- [ ] Update `apps/web/middleware.ts` with security headers
- [ ] Create `apps/api/src/common/guards/csrf.guard.ts`
- [ ] Create `apps/api/src/auth/strategies/jwt.strategy.ts`
- [ ] Create `apps/api/src/common/sanitizers/` folder
- [ ] Update password requirements in auth DTOs
- [ ] Implement encryption for PII fields
- [ ] Update `.env.example` with security notes
- [ ] Set up dependency scanning (npm audit)

---

## PHASE 3: FRONTEND ARCHITECTURE & AUTH
**Status**: Pending | **Primary Model**: 🟣 Haiku 4.5 | **Timeline**: 3-4 hours

### PROMPT 7: NextAuth Setup 🟣
- [ ] Create `apps/web/app/api/auth/[...nextauth]/route.ts`
- [ ] Configure Google OAuth provider
- [ ] Configure Credentials provider (email/password)
- [ ] Create `apps/web/lib/auth.ts` (auth options, helpers)
- [ ] Create `apps/web/app/(auth)/login/page.tsx`
- [ ] Create `apps/web/app/(auth)/register/page.tsx`
- [ ] Create `apps/web/components/auth/AuthProvider.tsx`
- [ ] Create `apps/web/components/auth/UserButton.tsx`
- [ ] Create `apps/web/components/auth/ProtectedRoute.tsx`
- [ ] Create `apps/web/middleware.ts` for route protection
- [ ] Create `apps/web/types/next-auth.d.ts` (type augmentation)

### PROMPT 15: Notification System UI 🟣
- [ ] Create `apps/web/components/layout/NotificationBell.tsx`
- [ ] Create `apps/web/app/(dashboard)/notifications/page.tsx`
- [ ] Create `apps/web/components/notifications/NotificationCard.tsx`
- [ ] Create `apps/web/components/notifications/NotificationPreferences.tsx`
- [ ] Create `apps/web/lib/notifications.ts` (API client)
- [ ] Create `apps/web/public/sw.js` (service worker)
- [ ] Implement real-time updates (WebSocket or polling)

### PROMPT 19: Mobile PWA Setup 🟣
- [ ] Create `apps/web/app/manifest.ts` (Next.js 14 format)
- [ ] Update `apps/web/app/layout.tsx` with manifest link
- [ ] Create PWA icons in `apps/web/public/icons/`
- [ ] Update `apps/web/public/sw.js` with cache strategy
- [ ] Create `apps/web/components/pwa/InstallPrompt.tsx`
- [ ] Create `apps/web/components/pwa/OfflineFallback.tsx`
- [ ] Update `apps/web/next.config.js` for PWA config
- [ ] Test on mobile devices

### SONNET TASK 5: Deal Ranking Algorithm 🔴
- [ ] Create `packages/shared/src/ranking/ranker.ts`
- [ ] Create `packages/shared/src/ranking/scoring-weights.ts`
- [ ] Create `packages/shared/src/ranking/filters.ts`
- [ ] Create `packages/shared/src/ranking/normalizer.ts`
- [ ] Implement multi-factor scoring (40-20-15-15-10 weights)
- [ ] Add comprehensive unit tests

### SONNET TASK 6: Notification Delivery System 🔴
- [ ] Create `apps/api/src/notifications/notifications.service.ts`
- [ ] Create `apps/api/src/notifications/channels/email.channel.ts` (SES)
- [ ] Create `apps/api/src/notifications/channels/push.channel.ts`
- [ ] Create `apps/api/src/notifications/channels/sms.channel.ts` (optional)
- [ ] Create `apps/api/src/notifications/templates/renderer.ts` (Handlebars)
- [ ] Create `apps/api/src/notifications/digest.builder.ts`
- [ ] Create `apps/api/src/notifications/rate-limiter.ts`
- [ ] Implement retry logic and failure tracking

---

## PHASE 4: USER EXPERIENCE FLOWS
**Status**: Pending | **Primary Model**: 🟣 Haiku 4.5 | **Timeline**: 6-8 hours

### PROMPT 8: User Onboarding Flow 🟣
- [ ] Create `apps/web/app/(dashboard)/onboarding/layout.tsx` (progress stepper)
- [ ] Create `apps/web/app/(dashboard)/onboarding/step1/page.tsx` (home airports)
- [ ] Create `apps/web/app/(dashboard)/onboarding/step2/page.tsx` (loyalty programs)
- [ ] Create `apps/web/app/(dashboard)/onboarding/step3/page.tsx` (credit cards)
- [ ] Create `apps/web/app/(dashboard)/onboarding/step4/page.tsx` (preferences)
- [ ] Create `apps/web/lib/onboarding.ts` (progress state, API calls)
- [ ] Create `apps/web/components/onboarding/StepIndicator.tsx`
- [ ] Create `apps/web/components/onboarding/AirportAutocomplete.tsx`
- [ ] Create `apps/web/components/onboarding/ProgramSelector.tsx`
- [ ] Create `apps/web/components/onboarding/CardSelector.tsx`

### PROMPT 9: Watcher Creation UI 🟣
- [ ] Create `apps/web/app/(dashboard)/watchers/new/page.tsx` (watcher form)
- [ ] Create `apps/web/app/(dashboard)/watchers/page.tsx` (watcher list/dashboard)
- [ ] Create `apps/web/app/(dashboard)/watchers/[id]/page.tsx` (detail view)
- [ ] Create `apps/web/components/watchers/WatcherCard.tsx`
- [ ] Create `apps/web/components/watchers/WatcherForm.tsx`
- [ ] Create `apps/web/components/watchers/DealCard.tsx`
- [ ] Create `apps/web/components/watchers/DealTable.tsx`
- [ ] Create `apps/web/components/watchers/FlexDateSlider.tsx`
- [ ] Create `apps/web/lib/watchers.ts` (API client, types, validation)
- [ ] Implement React Query for data fetching
- [ ] Add optimistic updates

### PROMPT 10: Basic Deal Display 🟣
- [ ] Create `apps/web/components/deals/DealCard.tsx`
- [ ] Create `apps/web/components/deals/DealDetails.tsx`
- [ ] Create `apps/web/components/deals/ValueBadge.tsx`
- [ ] Create `apps/web/components/deals/HowToBookModal.tsx`
- [ ] Create `apps/web/components/deals/DealFilters.tsx`
- [ ] Create `apps/web/lib/deals.ts` (types, helpers, formatting)
- [ ] Add loading skeletons
- [ ] Make cards interactive and responsive

### PROMPT 11: Hotel Search Integration UI 🟡 (Can parallelize)
- [ ] Create `apps/web/app/(dashboard)/hotels/page.tsx`
- [ ] Create `apps/web/components/hotels/HotelCard.tsx`
- [ ] Create `apps/web/components/hotels/HotelDetails.tsx`
- [ ] Create `apps/web/components/hotels/HotelFilters.tsx`
- [ ] Create `apps/web/components/hotels/HotelMap.tsx`
- [ ] Create `apps/web/lib/hotels.ts` (API client, types)
- [ ] Implement infinite scroll or pagination
- [ ] Add map integration
- [ ] Show affiliate disclaimers

### PROMPT 12: Activities & Experiences UI 🟡 (Can parallelize)
- [ ] Create `apps/web/app/(dashboard)/activities/page.tsx`
- [ ] Create `apps/web/components/activities/ActivityCard.tsx`
- [ ] Create `apps/web/components/activities/ActivityDetails.tsx`
- [ ] Create `apps/web/components/activities/ActivityFilters.tsx`
- [ ] Create `apps/web/components/shared/CategoryIcon.tsx`
- [ ] Create `apps/web/lib/activities.ts` (API client, types)
- [ ] Keep UI consistent with hotels
- [ ] Show affiliate disclosures

### PROMPT 13: Trip Board / Itinerary 🟣
- [ ] Create `apps/web/app/(dashboard)/trips/page.tsx` (trip list)
- [ ] Create `apps/web/app/(dashboard)/trips/[id]/page.tsx` (trip detail)
- [ ] Create `apps/web/components/trips/TripCard.tsx`
- [ ] Create `apps/web/components/trips/TripTimeline.tsx`
- [ ] Create `apps/web/components/trips/TripItem.tsx`
- [ ] Create `apps/web/components/trips/AddToTripModal.tsx`
- [ ] Create `apps/web/lib/trips.ts` (API client, export logic)
- [ ] Implement drag-and-drop reordering
- [ ] Add share link generation
- [ ] Implement .ics generation

### PROMPT 14: User Settings & Preferences 🟣
- [ ] Create `apps/web/app/(dashboard)/settings/layout.tsx` (sidebar layout)
- [ ] Create `apps/web/app/(dashboard)/settings/profile/page.tsx`
- [ ] Create `apps/web/app/(dashboard)/settings/loyalty/page.tsx`
- [ ] Create `apps/web/app/(dashboard)/settings/cards/page.tsx`
- [ ] Create `apps/web/app/(dashboard)/settings/notifications/page.tsx`
- [ ] Create `apps/web/app/(dashboard)/settings/privacy/page.tsx`
- [ ] Create `apps/web/components/settings/SettingSection.tsx`
- [ ] Create `apps/web/components/settings/ToggleSetting.tsx`
- [ ] Create `apps/web/components/settings/DangerZone.tsx`
- [ ] Add form validation with Zod
- [ ] Add confirmation modals for destructive actions

### PROMPT 18: Analytics & Tracking 🟡 (Can parallelize)
- [ ] Create `apps/web/lib/analytics.ts` (event tracking)
- [ ] Create `apps/web/app/api/events/route.ts` (POST endpoint)
- [ ] Add tracking to DealCard clicks
- [ ] Add tracking to affiliate link clicks
- [ ] Add tracking to booking buttons
- [ ] Add tracking to search form submissions
- [ ] Add tracking to onboarding completions
- [ ] Create `apps/web/components/analytics/ConsentBanner.tsx`
- [ ] Create `apps/web/app/(dashboard)/insights/page.tsx` (user stats)
- [ ] Create `apps/web/lib/tracking-context.tsx` (React context)

### SONNET TASK 7: Affiliate Tracking & Attribution 🔴
- [ ] Create `apps/api/src/affiliate/affiliate.service.ts`
- [ ] Create `apps/api/src/affiliate/link-generator.ts`
- [ ] Create `apps/api/src/affiliate/attribution.service.ts`
- [ ] Create `apps/api/src/affiliate/reporting.service.ts`
- [ ] Implement cookie-based attribution (30 days)
- [ ] Support multiple networks (Impact, CJ, Booking.com)
- [ ] Add conversion webhook handling

### SONNET TASK 8: Card Recommendation Engine 🔴
- [ ] Create `packages/shared/src/card-engine/recommender.ts`
- [ ] Create `packages/shared/src/card-engine/gap-analyzer.ts`
- [ ] Create `packages/shared/src/card-engine/card-database.json`
- [ ] Create `packages/shared/src/card-engine/explainer.ts`
- [ ] Implement gap-filling scoring algorithm
- [ ] Limit to 3 recommendations max
- [ ] Respect opt-out preferences

---

## PHASE 5: PRODUCTION READINESS
**Status**: Pending | **Mixed Models** | **Timeline**: 5-6 hours

### PROMPT 16: Card Recommendation UI 🟣
- [ ] Create `apps/web/app/(dashboard)/cards/recommendations/page.tsx`
- [ ] Create `apps/web/components/cards/RecommendationCard.tsx`
- [ ] Create `apps/web/components/cards/GapAnalysis.tsx`
- [ ] Create `apps/web/components/cards/CardComparison.tsx`
- [ ] Create `apps/web/components/cards/ConsentBanner.tsx`
- [ ] Create `apps/web/lib/cards.ts` (types, helpers)
- [ ] Add affiliate disclosure on all links
- [ ] Implement "not interested" dismissal

### PROMPT 17: Admin Dashboard Foundation 🟣
- [ ] Create `apps/web/app/(admin)/layout.tsx` (admin layout with sidebar)
- [ ] Create `apps/web/app/(admin)/dashboard/page.tsx` (overview)
- [ ] Create `apps/web/app/(admin)/users/page.tsx` (user management)
- [ ] Create `apps/web/app/(admin)/users/[id]/page.tsx` (user detail)
- [ ] Create `apps/web/app/(admin)/settings/page.tsx` (feature flags)
- [ ] Create `apps/web/components/admin/StatCard.tsx`
- [ ] Create `apps/web/components/admin/DataTable.tsx`
- [ ] Create `apps/web/components/admin/FeatureFlagToggle.tsx`
- [ ] Create `apps/web/components/admin/UserActivityLog.tsx`
- [ ] Create `apps/web/lib/admin.ts` (API client, permission checks)
- [ ] Add role-based access control
- [ ] Log all admin actions

### PROMPT 20: Email Templates 🟣
- [ ] Create `apps/api/src/templates/base.html` (responsive base template)
- [ ] Create `apps/api/src/templates/welcome.html`
- [ ] Create `apps/api/src/templates/deal-alert.html`
- [ ] Create `apps/api/src/templates/digest.html`
- [ ] Create `apps/api/src/templates/trip-reminder.html`
- [ ] Create `apps/api/src/email/email.service.ts` (Handlebars rendering)
- [ ] Create `apps/api/src/email/email.types.ts` (template interfaces)
- [ ] Test with Mailhog
- [ ] Ensure mobile-responsive

### PROMPT 21: Error Handling & Validation 🟣
- [ ] Create `apps/web/lib/errors.ts` (custom error classes)
- [ ] Create `apps/web/app/error.tsx` (global error boundary)
- [ ] Create `apps/web/app/not-found.tsx` (404 page)
- [ ] Update all API calls with error handling
- [ ] Create `apps/api/src/common/filters/http-exception.filter.ts`
- [ ] Add form validation (Zod schemas)
- [ ] Create `apps/web/components/ui/toast.tsx` (toast notifications)
- [ ] Log errors to monitoring service
- [ ] Use proper HTTP status codes

### SONNET TASK 9: Search Optimization & Caching 🔴
- [ ] Create `apps/api/src/cache/cache.service.ts` (Redis-based)
- [ ] Create `apps/api/src/cache/invalidation.service.ts`
- [ ] Create `apps/api/src/cache/normalization.ts`
- [ ] Implement TTL-based expiration
- [ ] Implement cache warming for popular routes
- [ ] Implement partial invalidation
- [ ] Add query normalization

### PROMPT 22: Rate Limiting & Cost Controls 🔴
- [ ] Create `apps/api/src/common/guards/rate-limit.guard.ts`
- [ ] Create `apps/api/src/common/decorators/rate-limit.decorator.ts`
- [ ] Create `apps/api/src/config/quotas.config.ts` (tier definitions)
- [ ] Update `apps/api/src/watchers/watchers.scheduler.ts` (watcher cron)
- [ ] Create `apps/api/src/common/interceptors/cache.interceptor.ts`
- [ ] Add watcher quota validation
- [ ] Create `apps/web/components/billing/QuotaDisplay.tsx`
- [ ] Show quota exceeded errors
- [ ] Add frequency limit enforcement

### SONNET TASK 10: Data Export & Privacy Compliance 🔴
- [ ] Create `apps/api/src/privacy/export.service.ts` (GDPR data export)
- [ ] Create `apps/api/src/privacy/deletion.service.ts` (account deletion)
- [ ] Create `apps/api/src/privacy/consent.service.ts` (consent tracking)
- [ ] Implement async export jobs
- [ ] Implement cascade deletion
- [ ] Generate deletion certificates
- [ ] Audit log consent changes

### PROMPT 25: Testing Suite 🟡 (Can parallelize)
- [ ] Create `apps/web/tests/setup.ts` (test environment)
- [ ] Create unit tests for `apps/web/lib/` utilities
- [ ] Create integration tests for user flows
- [ ] Create E2E tests with Playwright
- [ ] Create `apps/api/src/**/*.spec.ts` unit tests
- [ ] Create E2E tests for API endpoints using supertest
- [ ] Create `apps/web/tests/fixtures/` (mock data)
- [ ] Add "test" scripts to package.json files
- [ ] Aim for 80%+ coverage on critical paths

### SONNET TASK 11: Admin Cost Dashboard 🔴
- [ ] Create `apps/api/src/admin/cost/cost-tracking.service.ts`
- [ ] Create `apps/api/src/admin/cost/budget-alerts.service.ts`
- [ ] Create `apps/api/src/admin/cost/optimization-suggestions.ts`
- [ ] Track API costs by provider
- [ ] Track compute and email costs
- [ ] Implement budget alerts
- [ ] Generate optimization suggestions

### SONNET TASK 12: Integration Test Harness 🔴
- [ ] Create `packages/providers/test/harness.ts`
- [ ] Create `packages/providers/test/fixtures/` (sample responses)
- [ ] Create `packages/providers/test/scenarios/` (test scenarios)
- [ ] Create `packages/providers/test/benchmarks/` (perf tests)
- [ ] Test each provider adapter
- [ ] Test rate limiting
- [ ] Test error handling

### FINAL PROMPT: Documentation & Deployment 🟣
- [ ] Create `docs/SETUP.md` (step-by-step setup)
- [ ] Create `docs/ARCHITECTURE.md` (system architecture)
- [ ] Create `docs/API.md` (endpoint documentation)
- [ ] Create `docs/CONTRIBUTING.md` (code style, workflow)
- [ ] Create `infrastructure/terraform/main.tf` (AWS infrastructure)
- [ ] Create `.github/workflows/ci.yml` (test on PR)
- [ ] Create `.github/workflows/deploy-staging.yml`
- [ ] Create `.github/workflows/deploy-production.yml`
- [ ] Create `docker-compose.prod.yml`
- [ ] Expand root `Makefile` with deployment commands
- [ ] Create deployment runbook
- [ ] Add Grafana dashboards

---

## BUILD ORDER & DEPENDENCIES

```
Phase 1: Foundation (Sequential) - 2-3 hours
  ├─ PROMPT 1: Monorepo Setup
  ├─ PROMPT 2: TypeScript Config
  ├─ PROMPT 3: Docker Setup
  ├─ PROMPT 4: ✅ Database Schema (COMPLETE)
  └─ PROMPT 5: Next.js Shell

Phase 2: Backend (Sequential) - 4-5 hours
  ├─ PROMPT 6: NestJS Foundation
  ├─ SONNET 3: Provider Layer
  ├─ SONNET 4: Job Scheduler
  ├─ SONNET 23: Logging & Monitoring
  └─ SONNET 24: Security

Phase 3: Frontend & Auth (Can Parallelize) - 3-4 hours
  ├─ PROMPT 7: NextAuth Setup
  ├─ PROMPT 15: Notifications UI
  ├─ PROMPT 19: PWA Setup
  ├─ SONNET 5: Deal Ranking
  └─ SONNET 6: Notification Delivery

Phase 4: UX Flows (Sequential) - 6-8 hours
  ├─ PROMPT 8: Onboarding
  ├─ PROMPT 9: Watchers
  ├─ PROMPT 10: Deal Display
  ├─ PROMPT 11: Hotels UI (can parallelize with 12)
  ├─ PROMPT 12: Activities UI (can parallelize with 11)
  ├─ PROMPT 13: Trips
  ├─ PROMPT 14: Settings
  ├─ PROMPT 18: Analytics (can parallelize)
  ├─ SONNET 7: Affiliate Tracking
  └─ SONNET 8: Card Engine

Phase 5: Production (Mixed) - 5-6 hours
  ├─ PROMPT 16: Card Recommendations
  ├─ PROMPT 17: Admin Dashboard
  ├─ PROMPT 20: Email Templates
  ├─ PROMPT 21: Error Handling
  ├─ PROMPT 22: Rate Limiting
  ├─ PROMPT 25: Testing (can parallelize)
  ├─ SONNET 9: Caching & Search Optimization
  ├─ SONNET 10: Privacy & GDPR
  ├─ SONNET 11: Cost Dashboard
  ├─ SONNET 12: Test Harness
  └─ FINAL: Documentation & Deployment
```

---

## PARALLELIZATION OPPORTUNITIES

### With ChatGPT Codex (🟡):
These UI components can be built in parallel:
- **PROMPT 11** (Hotels UI) ↔ **PROMPT 12** (Activities UI) - Similar component patterns
- **PROMPT 18** (Analytics) - Can be implemented alongside **PROMPT 14** (Settings)
- **PROMPT 25** (Testing) - Can run in parallel with Phase 4-5 development

### Recommended Model Assignments:
| Task | Recommended | Reasoning |
|------|-------------|-----------|
| Phase 1-2 Foundation | 🟣 Haiku 4.5 | Straightforward setup, good for comprehensive scaffolding |
| Provider Layer (SONNET 3) | 🔴 Sonnet 4 | Complex abstraction, rate limiting, normalization |
| Job Scheduler (SONNET 4) | 🔴 Sonnet 4 | Sophisticated cron, batching, deduplication logic |
| UI Flows (Phase 4) | 🟣 Haiku 4.5 | Haiku excels at UI/form components, can handle volume |
| Complex Engines | 🔴 Sonnet 4 | Deal ranking, card recommendations, value calculations |
| Testing (PROMPT 25) | 🟡 Codex | Repetitive test patterns, good for parallelization |
| Hotels/Activities (PROMPT 11-12) | 🟡 Codex | Similar patterns, lower cognitive load, fast iteration |
| Documentation (FINAL) | 🟣 Haiku 4.5 | Comprehensive documentation, good style |

---

## EXECUTION STRATEGY

### Timeline: ~24-30 total hours

**Week 1:**
- Phase 1 (2-3 hrs) + Phase 2 (4-5 hrs) = 6-8 hours
- Run Haiku on Prompts 1-3, 5 in parallel with starting Sonnet Tasks 3-4

**Week 2:**
- Phase 3 (3-4 hrs) + Phase 4 (6-8 hrs) = 9-12 hours
- Run Haiku Prompts 6-18, parallelize Hotels/Activities/Analytics with Codex
- Sonnet continues with ranking, notification system, affiliate tracking

**Week 3:**
- Phase 5 (5-6 hrs) = 5-6 hours
- Complete Haiku Prompts 16-25
- Sonnet completes caching, privacy, cost dashboard, test harness
- Run testing suite with Codex
- Documentation and deployment finalization

### Recommended Workflow:
1. Start Haiku on Phase 1 (Prompts 1-3)
2. While Haiku builds, start Sonnet on Tasks 3-4 (Provider + Jobs)
3. Once Phase 1 complete, start Phase 2-3 in parallel
4. Use Codex for repetitive components (Hotels, Activities, Tests)
5. Have Sonnet focus on complex engines (Ranking, Notifications, Affiliate)
6. Finish with documentation and deployment

---

## QUICK START COMMANDS

```bash
# After Phase 1 is complete:
npm install
npm run build
docker-compose up

# Access:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs
- Mailhog: http://localhost:8025
- Database: localhost:5432
- Redis: localhost:6379
```

---

## NOTES & CONSIDERATIONS

- ✅ **Database Schema**: Already built with 13+ models, indexes, seed data
- ✅ **Value Engine**: Complete with calculator, transfer partners, explainer
- 🔴 Sonnet should handle all complex business logic and integrations
- 🟣 Haiku handles UI, components, and standard CRUD operations
- 🟡 Codex can accelerate repetitive component development
- All phases depend on Phase 1 foundation
- Run `npm audit` after all dependencies are installed
- Test Docker setup before moving to Phase 2
- Keep .env variables secure, never commit them
