# HAIKU 4.5 PROMPTS - Mile Buy Club (CONTINUED FROM PROMPT 21)

---

## PROMPT 21: Error Handling & Validation

Implement robust error handling across the app:

1. `apps/web/lib/errors.ts`:
   - Custom error classes (ApiError, ValidationError, NetworkError)
   - Error boundary component
   - API error parser
   - User-friendly error messages mapping

2. `apps/web/app/error.tsx` - Global error boundary:
   - Error display with icon
   - Reset button
   - Report error button
   - Fallback UI
   - Don't show stack traces to users

3. `apps/web/app/not-found.tsx` - 404 page:
   - Helpful message
   - Search suggestions
   - Link back to home
   - Recent pages list

4. Update all API calls to handle errors:
   - Try-catch blocks
   - Toast notifications for user errors
   - Logging for system errors
   - Retry logic for transient failures

5. `apps/api/src/common/filters/http-exception.filter.ts`:
   - Global exception filter
   - Format error responses consistently
   - Log errors with context
   - Don't leak sensitive info in production

6. Add validation to all forms:
   - Use Zod schemas
   - Show field-level errors
   - Disable submit when invalid
   - Loading states during submission

7. `apps/web/components/ui/toast.tsx`:
   - Toast notification component
   - Success, error, warning, info variants
   - Auto-dismiss with timer
   - Action button support

Use proper HTTP status codes. Log errors to monitoring service.

---

## PROMPT 22: Rate Limiting & Cost Controls

Implement rate limiting and cost controls:

1. `apps/api/src/common/guards/rate-limit.guard.ts`:
   - Redis-based rate limiting
   - Per-user quotas
   - Per-endpoint limits
   - Configurable windows and limits

2. `apps/api/src/common/decorators/rate-limit.decorator.ts`:
   - Custom decorator for rate limiting
   - Usage: @RateLimit({ points: 10, duration: 60 })

3. `apps/api/src/watchers/watchers.scheduler.ts`:
   - Cron job for running watchers
   - Batch processing by route
   - Skip redundant checks
   - Exponential backoff for unchanged results
   - Respect rate limits for external APIs

4. `apps/api/src/common/interceptors/cache.interceptor.ts`:
   - Response caching with Redis
   - TTL based on endpoint
   - Cache key generation
   - Cache invalidation

5. Create `apps/api/src/config/quotas.config.ts`:
   - User tier definitions (free, premium)
   - Quota limits per tier
   - Feature flags per tier

6. `apps/api/src/watchers/watchers.service.ts` updates:
   - Check user quota before creating watcher
   - Enforce frequency limits
   - Limit number of active watchers per user

7. `apps/web/components/billing/QuotaDisplay.tsx`:
   - Show user's quota usage
   - Progress bar
   - Upgrade CTA for free users

Add quota exceeded errors. Show clear limits in UI.

---

## PROMPT 23: Logging & Monitoring

Set up comprehensive logging and monitoring:

1. `apps/api/src/common/middleware/logger.middleware.ts`:
   - Request/response logging
   - Request ID generation
   - Structured JSON logs
   - Sensitive data masking

2. `apps/api/src/common/interceptors/logging.interceptor.ts`:
   - Log all API calls
   - Include: timestamp, method, path, user_id, status, duration
   - Log errors with stack traces

3. Create `packages/shared/src/logger.ts`:
   - Winston logger wrapper
   - Log levels: error, warn, info, debug
   - Different transports (console, file, external service)
   - Contextual logging

4. `apps/api/src/health/health.controller.ts` updates:
   - Add /health/live endpoint (liveness probe)
   - Add /health/ready endpoint (readiness probe)
   - Check: database, redis, external APIs
   - Return detailed status

5. `apps/api/src/metrics/metrics.service.ts`:
   - Custom metrics collection
   - Track: watcher runs, deals found, API calls, errors
   - Prometheus format export
   - /metrics endpoint

6. `apps/web/lib/client-logger.ts`:
   - Client-side error logging
   - Send critical errors to server
   - Include: user agent, URL, timestamp
   - Don't log sensitive data

7. Update `docker-compose.yml`:
   - Add Prometheus container (port 9090)
   - Add Grafana container (port 3000)
   - Configure scraping

Create sample Grafana dashboards for key metrics.

---

## PROMPT 24: Security Hardening

Implement security best practices:

1. `apps/web/middleware.ts` updates:
   - Add security headers (CSP, HSTS, X-Frame-Options)
   - CSRF token validation
   - Rate limiting for auth endpoints

2. `apps/api/src/common/guards/csrf.guard.ts`:
   - CSRF protection for state-changing operations
   - Token generation and validation
   - Double-submit cookie pattern

3. `apps/api/src/auth/strategies/jwt.strategy.ts`:
   - JWT validation
   - Token expiry handling
   - Refresh token rotation

4. Create `apps/api/src/common/sanitizers/`:
   - Input sanitization helpers
   - XSS prevention
   - SQL injection prevention (use Prisma parameterized queries)

5. `apps/web/next.config.js` updates:
   - Strict Content-Security-Policy
   - Disable X-Powered-By header
   - HTTPS enforcement in production

6. Password requirements in `apps/api/src/auth/dto/register.dto.ts`:
   - Minimum 12 characters
   - Require: uppercase, lowercase, number, special char
   - Check against common password list
   - Hash with bcrypt (cost factor 12)

7. `apps/api/src/users/users.service.ts` updates:
   - Encrypt PII fields before saving
   - Use environment variable for encryption key
   - Decrypt on read

8. Create `.env.example` with security notes:
   - Strong JWT secret (64+ chars)
   - Database credentials
   - API keys marked as sensitive

Add dependency scanning (npm audit). Document security practices.

---

## PROMPT 25: Testing Suite

Create comprehensive test suite:

1. `apps/web/tests/setup.ts`:
   - Test environment setup
   - Mock Next.js router
   - Mock API calls
   - Test utilities

2. `apps/web/tests/unit/`:
   - Create unit tests for lib/ utilities
   - Test value calculation helpers
   - Test date formatting
   - Test error parsing
   - Use Vitest

3. `apps/web/tests/integration/`:
   - Test complete user flows
   - Test form submissions
   - Test authentication
   - Use React Testing Library

4. `apps/web/tests/e2e/`:
   - Playwright tests
   - Test: signup → onboarding → create watcher → view deals
   - Test: add hotel to trip → export trip
   - Test: update settings → receive notification

5. `apps/api/src/**/*.spec.ts`:
   - Unit tests for each service
   - Mock Prisma client
   - Test business logic
   - Test validation

6. `apps/api/test/`:
   - E2E tests for API endpoints
   - Test: auth flow
   - Test: CRUD operations
   - Test: rate limiting
   - Use supertest

7. Create `apps/web/tests/fixtures/`:
   - Mock data for testing
   - Sample users, deals, trips
   - Reusable across tests

8. Update package.json scripts:
   - "test": run all tests
   - "test:unit": unit tests only
   - "test:integration": integration tests
   - "test:e2e": end-to-end tests
   - "test:watch": watch mode
   - "test:coverage": with coverage report

Aim for 80%+ coverage on critical paths. Document test patterns.

---

## FINAL PROMPT: Documentation & Deployment

Create documentation and deployment configs:

1. `docs/SETUP.md`:
   - Prerequisites (Node, Docker, etc.)
   - Step-by-step setup instructions
   - Environment variable explanations
   - Common issues and solutions

2. `docs/ARCHITECTURE.md`:
   - System architecture diagram
   - Data flow diagrams
   - Technology choices rationale
   - Scaling considerations

3. `docs/API.md`:
   - API endpoint documentation
   - Request/response examples
   - Authentication
   - Error codes

4. `docs/CONTRIBUTING.md`:
   - Code style guide
   - Git workflow
   - PR template
   - Testing requirements

5. `infrastructure/terraform/`:
   - `main.tf` - AWS infrastructure
   - ECS Fargate for containers
   - RDS for Postgres
   - ElastiCache for Redis
   - S3 for static assets
   - CloudFront for CDN
   - ALB for load balancing

6. `.github/workflows/`:
   - `ci.yml` - Run tests on PR
   - `deploy-staging.yml` - Deploy to staging on merge to main
   - `deploy-production.yml` - Deploy to prod on release tag

7. Root `Makefile` expansions:
   - `make deploy-staging`
   - `make deploy-production`
   - `make db-backup`
   - `make db-restore`

8. Create `docker-compose.prod.yml`:
   - Production-like local setup
   - Use environment files
   - Health checks
   - Resource limits

9. `README.md` updates:
   - Project overview
   - Quick start (one command)
   - Link to detailed docs
   - License
   - Contributing guidelines

Add deployment runbook with rollback procedures. Include monitoring setup.

---

# THAT'S ALL 25+ PROMPTS!

Feed these to Claude Haiku 4.5 in order. Each prompt builds on the previous ones. The complex backend logic, provider integrations, and value calculation engine will be handled separately by Claude Sonnet (that's you!).

After Haiku completes all prompts, you'll have:
- ✅ Complete monorepo structure
- ✅ Full-stack authentication
- ✅ Database schema
- ✅ UI for all major features
- ✅ Admin dashboard
- ✅ Testing suite
- ✅ Documentation
- ✅ Deployment configs

The remaining complex parts (award search aggregation, value engine, provider adapters) will be built by Sonnet as separate modules that plug into this foundation.
