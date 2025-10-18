# PHASE 5: Task Assignment & Dependency Analysis

## 📊 **Summary**

**Total Tasks**: 10
- **Independent (Can Start Now)**: 7 tasks
- **Dependent (Need Previous Work)**: 3 tasks
- **Haiku Recommended**: 5 tasks
- **Codex Recommended**: 2 tasks
- **Sonnet Recommended**: 3 tasks

---

## 🟢 **INDEPENDENT TASKS (Can Start Immediately)**

### **SONNET TASK 9: Search Optimization & Caching** 🔴 SONNET
**Location**: `apps/api/src/cache/`

**Complexity**: HIGH - Requires intelligent caching strategies
**Dependencies**: ✅ None - Standalone backend service
**Model**: 🔴 **SONNET** (Complex algorithms, Redis strategies)

**Why Sonnet**:
- Complex cache key normalization logic
- TTL calculation based on route popularity
- Cache warming strategies
- Invalidation logic with partial updates
- Needs architectural thinking

**Files to Create** (3):
- `cache.service.ts` - Redis caching with TTL strategies
- `invalidation.service.ts` - Intelligent cache invalidation
- `normalization.ts` - Query normalization (LAX = Los Angeles)

**Estimated Time**: 1.5 hours

---

### **SONNET TASK 10: Privacy & GDPR Compliance** 🔴 SONNET
**Location**: `apps/api/src/privacy/`

**Complexity**: HIGH - Legal compliance requirements
**Dependencies**: ✅ None - Standalone privacy features
**Model**: 🔴 **SONNET** (Complex compliance logic, data handling)

**Why Sonnet**:
- GDPR/CCPA compliance complexity
- Cascading deletion logic across all tables
- Data export with sensitive data handling
- Consent tracking and audit logging
- Legal considerations

**Files to Create** (3):
- `export.service.ts` - Complete user data export (JSON)
- `deletion.service.ts` - Hard delete with cascade, anonymization
- `consent.service.ts` - Consent tracking and audit log

**Estimated Time**: 2 hours

---

### **SONNET TASK 11: Admin Cost Dashboard** 🔴 SONNET
**Location**: `apps/api/src/admin/cost/`

**Complexity**: MEDIUM-HIGH - Cost tracking and optimization
**Dependencies**: ✅ None - Standalone admin features
**Model**: 🔴 **SONNET** (Complex cost algorithms, optimization suggestions)

**Why Sonnet**:
- Cost tracking across multiple services
- Budget alerting logic
- Optimization suggestion algorithms
- Cost estimation formulas
- Admin-level features

**Files to Create** (3):
- `cost-tracking.service.ts` - Track API/compute/email/storage costs
- `budget-alerts.service.ts` - Alert on budget limits, auto-disable features
- `optimization-suggestions.ts` - Suggest cache improvements, find redundant calls

**Estimated Time**: 1.5 hours

---

### **PROMPT 20: Email Templates** 🟣 HAIKU
**Location**: `apps/api/src/templates/`

**Complexity**: LOW-MEDIUM - HTML template creation
**Dependencies**: ✅ None - Standalone templates
**Model**: 🟣 **HAIKU** (UI/template work, responsive HTML)

**Why Haiku**:
- HTML/CSS template creation
- Responsive email design
- Repetitive structure across templates
- Straightforward implementation
- UI-focused work

**Files to Create** (7):
- `base.html` - Base responsive template with header/footer
- `welcome.html` - Welcome email
- `deal-alert.html` - Deal notification
- `digest.html` - Daily/weekly digest
- `trip-reminder.html` - Trip reminder
- `password-reset.html` - Password reset
- `styles/` - Email CSS (inline)

**Estimated Time**: 1 hour

---

### **PROMPT 21: Error Handling & Validation** 🟣 HAIKU
**Location**: `apps/web/lib/errors.ts` + `apps/api/src/common/filters/`

**Complexity**: MEDIUM - Standardized error handling
**Dependencies**: ✅ None - Can add to existing code
**Model**: 🟣 **HAIKU** (Structured, repetitive patterns)

**Why Haiku**:
- Custom error classes (repetitive patterns)
- Error boundary component (standard React pattern)
- Global exception filter (NestJS boilerplate)
- 404 page (simple UI)
- Validation decorators (repetitive)

**Files to Create** (8):
- `apps/web/lib/errors.ts` - Custom error classes
- `apps/web/app/error.tsx` - Error boundary
- `apps/web/app/not-found.tsx` - 404 page
- `apps/api/src/common/filters/http-exception.filter.ts` - Global filter
- `apps/api/src/common/filters/validation-exception.filter.ts` - Validation filter
- `apps/api/src/common/pipes/validation.pipe.ts` - Custom validation
- Update existing API calls with error handling

**Estimated Time**: 1.5 hours

---

### **PROMPT 22: Rate Limiting & Cost Controls** 🟣 HAIKU
**Location**: `apps/api/src/common/guards/`

**Complexity**: MEDIUM - Redis-based rate limiting
**Dependencies**: ✅ None - Standalone middleware
**Model**: 🟣 **HAIKU** (Structured guards, decorators, configs)

**Why Haiku**:
- Rate limit guard (standard NestJS pattern)
- Custom decorator (boilerplate)
- Cache interceptor (standard pattern)
- Config file (structured data)
- Quota definitions (structured data)

**Files to Create** (5):
- `rate-limit.guard.ts` - Redis-based rate limiting
- `rate-limit.decorator.ts` - Custom decorator
- `cache.interceptor.ts` - Response caching
- `quotas.config.ts` - User tier definitions
- `cost-tracker.ts` - API cost tracking

**Estimated Time**: 1.5 hours

---

### **SONNET TASK 12: Integration Test Harness** 🟡 CODEX
**Location**: `packages/providers/test/`

**Complexity**: MEDIUM - Testing framework
**Dependencies**: ✅ None - Tests providers that already exist
**Model**: 🟡 **CODEX** (Repetitive test patterns, fixtures)

**Why Codex**:
- Test harness with repetitive patterns
- Mock API responses (fixtures)
- Test scenarios (similar structure)
- Benchmark tests (similar structure)
- Can parallelize test writing

**Files to Create** (10+):
- `harness.ts` - Test framework
- `fixtures/flight-responses.json` - Mock flight data
- `fixtures/hotel-responses.json` - Mock hotel data
- `fixtures/activity-responses.json` - Mock activity data
- `scenarios/success-scenarios.ts` - Happy path tests
- `scenarios/error-scenarios.ts` - Error handling tests
- `scenarios/rate-limit-scenarios.ts` - Rate limit tests
- `benchmarks/performance.spec.ts` - Performance tests

**Estimated Time**: 2 hours

---

## 🟡 **DEPENDENT TASKS (Need Previous Work)**

### **PROMPT 16: Card Recommendation UI** 🟣 HAIKU
**Location**: `apps/web/app/(dashboard)/cards/`

**Complexity**: MEDIUM - UI for card recommendations
**Dependencies**: 
- ⚠️ **PROMPT 7: NextAuth** (needs authentication)
- ✅ **SONNET TASK 8: Card Engine** (backend exists ✅)

**Model**: 🟣 **HAIKU** (UI components, forms)

**Why Haiku**:
- Component creation (cards, comparisons)
- UI layout and styling
- Form handling
- API integration (straightforward)

**Blockers**:
- Needs authentication to protect `/dashboard/cards/*` routes
- Can build with mock auth, integrate later

**Files to Create** (6):
- `app/(dashboard)/cards/recommendations/page.tsx` - Main page
- `components/cards/RecommendationCard.tsx` - Card component
- `components/cards/GapAnalysis.tsx` - Gap visualization
- `components/cards/CardComparison.tsx` - Compare cards side-by-side
- `components/cards/ConsentBanner.tsx` - Affiliate consent
- `lib/cards.ts` - API client

**Estimated Time**: 2 hours

---

### **PROMPT 17: Admin Dashboard Foundation** 🟣 HAIKU
**Location**: `apps/web/app/(admin)/`

**Complexity**: MEDIUM - Admin UI with tables and stats
**Dependencies**: 
- ⚠️ **PROMPT 7: NextAuth** (needs authentication + role check)
- ✅ **SONNET TASK 7: Affiliate** (backend exists ✅)
- ✅ **SONNET TASK 11: Cost Dashboard** (can build in parallel)

**Model**: 🟣 **HAIKU** (UI components, tables, dashboards)

**Why Haiku**:
- Dashboard layout
- Tables with filtering
- Stats cards
- Charts and graphs
- Admin-specific UI

**Blockers**:
- Needs authentication with admin role check
- Can build with mock admin user, integrate later

**Files to Create** (8):
- `app/(admin)/layout.tsx` - Admin layout with sidebar
- `app/(admin)/dashboard/page.tsx` - Overview with stats
- `app/(admin)/users/page.tsx` - User management table
- `app/(admin)/users/[id]/page.tsx` - User detail view
- `app/(admin)/settings/page.tsx` - Feature flags and settings
- `components/admin/UserTable.tsx` - User table component
- `components/admin/StatsCard.tsx` - Stats card component
- `components/admin/FeatureFlagToggle.tsx` - Feature flag toggle

**Estimated Time**: 2.5 hours

---

### **PROMPT 25: Testing Suite** 🟡 CODEX
**Location**: `apps/web/tests/` + `apps/api/test/`

**Complexity**: HIGH - Comprehensive test coverage
**Dependencies**: 
- ⚠️ **PROMPT 7: NextAuth** (to test auth flows)
- ⚠️ **PROMPT 8-14: UI Components** (to test user flows)
- ✅ **Backend APIs** (most exist, can test now)

**Model**: 🟡 **CODEX** (Repetitive test patterns, fixtures)

**Why Codex**:
- Many similar test files
- Fixture creation (mock data)
- Unit tests (repetitive patterns)
- E2E tests (similar structure)
- Can parallelize across test types

**Blockers**:
- E2E tests need completed user flows
- Integration tests need auth
- Can start with unit tests and API tests NOW

**Files to Create** (20+):
- `apps/web/tests/setup.ts` - Test setup
- `apps/web/tests/unit/*.test.ts` - Unit tests for utilities
- `apps/web/tests/integration/*.test.tsx` - Component integration tests
- `apps/web/tests/e2e/*.spec.ts` - Playwright E2E tests
- `apps/api/src/**/*.spec.ts` - Service unit tests (8+ files)
- `apps/api/test/*.e2e-spec.ts` - API E2E tests (6+ files)
- `apps/web/tests/fixtures/` - Mock data

**Estimated Time**: 4+ hours (can be split)

---

## 🎯 **RECOMMENDED BUILD ORDER**

### **Batch 1: Independent Backend (Start Now with Sonnet)**
**Time**: ~5 hours
1. ✅ SONNET TASK 9: Caching (1.5h) - I can do this
2. ✅ SONNET TASK 10: Privacy/GDPR (2h) - I can do this
3. ✅ SONNET TASK 11: Admin Cost Dashboard (1.5h) - I can do this

### **Batch 2: Independent Infrastructure (Parallel with Haiku)**
**Time**: ~4 hours
1. 🟣 PROMPT 20: Email Templates (1h)
2. 🟣 PROMPT 21: Error Handling (1.5h)
3. 🟣 PROMPT 22: Rate Limiting (1.5h)

### **Batch 3: Testing (Parallel with Codex)**
**Time**: ~2 hours (partial)
1. 🟡 SONNET TASK 12: Integration Test Harness (2h)
2. 🟡 PROMPT 25: Unit Tests & API Tests (partial - 2h)

### **Batch 4: Dependent UI (After Codex finishes Phase 3)**
**Time**: ~4.5 hours
1. 🟣 PROMPT 16: Card Recommendation UI (2h)
2. 🟣 PROMPT 17: Admin Dashboard (2.5h)

### **Batch 5: E2E Testing (After all UI complete)**
**Time**: ~2 hours
1. 🟡 PROMPT 25: E2E Tests (remaining)

---

## 📊 **Parallelization Strategy**

### **NOW (No Dependencies)**
- **Sonnet (Me)**: SONNET 9, 10, 11 (Backend)
- **Haiku (Parallel)**: PROMPT 20, 21, 22 (Infrastructure)
- **Codex (Parallel)**: SONNET 12, PROMPT 25 (partial - unit/API tests)

### **AFTER PHASE 3 (Codex finishes NextAuth)**
- **Haiku**: PROMPT 16, 17 (UI with auth)
- **Codex**: PROMPT 25 (E2E tests)

---

## 🚦 **Status Indicators**

- ✅ **Can start immediately** (7 tasks)
- ⚠️ **Blocked by Phase 3 auth** (3 tasks)
- 🔴 **Complex/Sonnet** (3 tasks)
- 🟣 **Structured/Haiku** (5 tasks)
- 🟡 **Repetitive/Codex** (2 tasks)

---

## 💡 **Key Insights**

1. **70% of Phase 5 is independent** and can start now
2. **Only 3 tasks are blocked** by Phase 3 auth
3. **Backend work (Sonnet)** can proceed without any blockers
4. **Infrastructure (Haiku)** can proceed in parallel
5. **Testing (Codex)** can start partial work (unit/API tests)
6. **High parallelization potential** - 3 models can work simultaneously

---

## 🎯 **Immediate Action Plan**

**I (Sonnet) should build next**:
1. SONNET TASK 9: Caching (most impactful for performance)
2. SONNET TASK 10: Privacy/GDPR (legal requirement)
3. SONNET TASK 11: Admin Cost Dashboard (monitoring requirement)

**Estimated completion**: 5 hours for all 3 tasks

**Haiku can work in parallel on**:
- PROMPT 20: Email Templates
- PROMPT 21: Error Handling
- PROMPT 22: Rate Limiting

**Codex can work in parallel on**:
- SONNET TASK 12: Test Harness
- PROMPT 25: Unit tests for existing backend services

**After Phase 3 complete**:
- PROMPT 16, 17 can be built
- E2E tests can be completed
