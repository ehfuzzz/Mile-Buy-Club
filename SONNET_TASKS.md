# SONNET 4 COMPLEX TASKS - Mile Buy Club

These are the advanced, complex components that require sophisticated logic. I (Claude Sonnet 4) will build these directly.

---

## TASK 1: Complete Prisma Schema with Advanced Models

**File**: `packages/database/prisma/schema.prisma`

Extend the basic schema with:
- Watcher model with complex scheduling
- Deal model with polymorphic types
- Alert model with delivery tracking
- AffiliateClick model with revenue tracking
- Proper indexes for performance
- Encrypted fields for PII
- Cascade deletes and constraints
- Seed data script

---

## TASK 2: Award Value Calculation Engine

**Location**: `packages/shared/src/value-engine/`

Build the core value calculation system:
- `calculator.ts` - Main calculation logic
  - Calculate cents-per-point (cpp)
  - Factor in surcharges and fees
  - Compare to cash alternative
  - Compute value thresholds
  
- `transfer-partners.ts` - Transfer partner database
  - JSON database of transfer ratios
  - Transfer time estimates
  - Bonus multipliers
  
- `explainer.ts` - Generate booking instructions
  - Step-by-step how to book
  - Transfer partner paths
  - Portal vs direct booking
  - Phone number and wait time estimates

- `types.ts` - TypeScript interfaces
- `calculator.spec.ts` - Comprehensive tests

---

## TASK 3: Provider Abstraction Layer

**Location**: `packages/providers/src/`

Create the pluggable provider architecture:

```
providers/
├── base/
│   ├── FlightProvider.ts (abstract base class)
│   ├── HotelProvider.ts
│   ├── ActivityProvider.ts
│   └── types.ts
├── flights/
│   ├── CashFlightAdapter.ts (for metasearch APIs)
│   ├── AwardSeatAdapter.ts (abstract)
│   └── test-harness.ts
├── hotels/
│   ├── BookingDotComAdapter.ts
│   ├── ExpediaAdapter.ts
│   └── TripDotComAdapter.ts
├── activities/
│   ├── ViatorAdapter.ts
│   └── GetYourGuideAdapter.ts
└── registry.ts (provider registration)
```

Each adapter must:
- Implement base interface
- Handle rate limiting internally
- Normalize responses to common format
- Include retry logic with backoff
- Log all API calls
- Support test mode

---

## TASK 4: Background Job Scheduler

**Location**: `apps/api/src/jobs/`

Build the BullMQ-based job system:

- `queue.module.ts` - BullMQ setup
- `watcher.processor.ts` - Process watcher runs
  - Batch similar searches
  - Deduplicate API calls
  - Cache results
  - Store new deals
  - Send alerts for good deals
  
- `deal-cleanup.processor.ts` - Expire old deals
- `alert-digest.processor.ts` - Send daily/weekly digests
- `scheduler.service.ts` - Cron job registration
  - Calculate optimal run times
  - Load balance across time
  - Respect user frequency settings

---

## TASK 5: Deal Ranking Algorithm

**Location**: `packages/shared/src/ranking/`

Sophisticated deal ranking system:

- `ranker.ts` - Main ranking logic
  - Multi-factor scoring:
    - Value (cpp) - 40% weight
    - Convenience (fewer stops) - 20%
    - Timing (how close to preferred dates) - 15%
    - Reliability (airline/route history) - 15%
    - Availability (how many seats) - 10%
  
- `scoring-weights.ts` - Configurable weights
- `filters.ts` - Apply user filters efficiently
- `normalizer.ts` - Normalize scores 0-100

---

## TASK 6: Notification Delivery System

**Location**: `apps/api/src/notifications/`

Smart notification delivery:

- `notifications.service.ts`:
  - Aggregate similar deals (don't spam)
  - Respect user frequency preferences
  - Handle delivery failures with retry
  - Track open/click rates
  
- `channels/`:
  - `email.channel.ts` - SES integration
  - `push.channel.ts` - Web Push implementation
  - `sms.channel.ts` - Twilio (feature flagged)
  
- `templates/renderer.ts` - Handlebars rendering
- `digest.builder.ts` - Build digest emails
- `rate-limiter.ts` - Per-user notification limits

---

## TASK 7: Affiliate Tracking & Attribution

**Location**: `apps/api/src/affiliate/`

Revenue tracking system:

- `affiliate.service.ts`:
  - Generate tracked affiliate links
  - Cookie-based attribution (30 days)
  - Click tracking and storage
  - Revenue estimation
  - Conversion tracking webhooks
  
- `link-generator.ts` - Build affiliate URLs
  - Support multiple networks (Impact, CJ, Booking.com)
  - Add tracking parameters
  - Shorten links if needed
  
- `attribution.service.ts` - Match clicks to conversions
- `reporting.service.ts` - Revenue reports for admin

---

## TASK 8: Card Recommendation Engine

**Location**: `packages/shared/src/card-engine/`

Intelligent card suggestions:

- `recommender.ts`:
  - Analyze user's current cards
  - Identify coverage gaps
  - Score cards based on:
    - Gap filling (primary)
    - Bonus value (secondary)
    - Annual fee vs benefit (tertiary)
    - User's spending patterns (if available)
  
- `gap-analyzer.ts` - Find loyalty program gaps
- `card-database.json` - Card catalog with metadata
- `explainer.ts` - Generate "why this card" text

Never recommend more than 3 cards at once. Respect opt-out.

---

## TASK 9: Search Optimization & Caching

**Location**: `apps/api/src/cache/`

Intelligent caching system:

- `cache.service.ts`:
  - Redis-based caching
  - Cache keys: normalize by route/date/cabin
  - TTL: 2-6 hours based on route popularity
  - Cache warming for popular routes
  
- `invalidation.service.ts`:
  - Invalidate on inventory changes
  - Partial invalidation for date ranges
  
- `normalization.ts`:
  - Normalize similar queries (LAX = Los Angeles)
  - Date range bucketing
  - Cabin equivalence

---

## TASK 10: Data Export & Privacy Compliance

**Location**: `apps/api/src/privacy/`

GDPR/CCPA compliance:

- `export.service.ts`:
  - Generate complete user data export (JSON)
  - Include: profile, searches, deals, trips, clicks
  - Async job with email delivery
  
- `deletion.service.ts`:
  - Hard delete user and all related data
  - Cascade to all tables
  - Keep anonymized analytics
  - Generate deletion certificate
  
- `consent.service.ts`:
  - Track consent changes
  - Apply consent to processing
  - Audit log of consent

---

## TASK 11: Admin Cost Dashboard

**Location**: `apps/api/src/admin/cost/`

Track operational costs:

- `cost-tracking.service.ts`:
  - Track API call costs by provider
  - Track compute costs (estimate)
  - Track email/SMS costs
  - Track storage costs
  
- `budget-alerts.service.ts`:
  - Alert when approaching budget limits
  - Auto-disable expensive features
  
- `optimization-suggestions.ts`:
  - Suggest cache improvements
  - Identify redundant API calls
  - Find inefficient watchers

---

## TASK 12: Integration Test Harness

**Location**: `packages/providers/test/`

Provider testing framework:

- `harness.ts`:
  - Test each provider adapter
  - Mock API responses
  - Verify normalization
  - Test error handling
  - Test rate limiting
  
- `fixtures/` - Sample API responses
- `scenarios/` - Test scenarios
- `benchmarks/` - Performance tests

---

## BUILD ORDER:

1. ✅ Prisma Schema (TASK 1) - Foundation for everything
2. ✅ Provider Abstraction (TASK 3) - Enables integrations
3. ✅ Value Engine (TASK 2) - Core business logic
4. ✅ Deal Ranking (TASK 5) - Depends on value engine
5. ✅ Background Jobs (TASK 4) - Depends on providers
6. ✅ Notification System (TASK 6) - Depends on jobs
7. ✅ Caching (TASK 9) - Performance optimization
8. ✅ Affiliate Tracking (TASK 7) - Revenue system
9. ✅ Card Recommendations (TASK 8) - Advanced feature
10. ✅ Privacy Compliance (TASK 10) - Legal requirement
11. ✅ Cost Dashboard (TASK 11) - Operations
12. ✅ Test Harness (TASK 12) - Quality assurance

I'll build these in order, creating production-ready, well-tested code.
