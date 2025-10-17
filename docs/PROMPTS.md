# Mile Buy Club - All Implementation Prompts

This document contains all 25+ prompts referenced in the TODO.md. Use this as a quick reference when implementing each section.

## Quick Index

- **Phase 1**: Prompts 1-5 (Foundation)
- **Phase 2**: Prompts 6, 20, 22-24 + Sonnet Tasks 3-4, 23-24
- **Phase 3**: Prompts 7, 15, 19 + Sonnet Tasks 5-6
- **Phase 4**: Prompts 8-14, 18 + Sonnet Tasks 7-8
- **Phase 5**: Prompts 16-17, 20-22, 25 + Sonnet Tasks 9-12, Final

---

## PROMPT 1: Monorepo Setup & Package.json Files

Create a turborepo monorepo structure for "Mile Buy Club" with the following:

1. Root `package.json` with:
   - Turborepo for build orchestration
   - Workspaces: apps/*, packages/*
   - Scripts: dev, build, test, lint
   - DevDependencies: typescript@5.3, turbo, prettier, eslint

2. Create `apps/web/package.json` for Next.js 14:
   - Dependencies: next@14, react@18, react-dom@18, next-auth, @tanstack/react-query
   - DevDependencies: @types/react, @types/node, tailwindcss, postcss, autoprefixer

3. Create `apps/api/package.json` for NestJS:
   - Dependencies: @nestjs/core, @nestjs/common, @nestjs/platform-express, @prisma/client, class-validator, class-transformer
   - DevDependencies: @nestjs/cli, @types/node, ts-node

4. Create `packages/database/package.json`:
   - Dependencies: @prisma/client
   - DevDependencies: prisma

5. Create `packages/shared/package.json`:
   - Dependencies: zod
   - DevDependencies: typescript

6. Create `packages/providers/package.json`:
   - Dependencies: axios, bottleneck (rate limiting)
   - DevDependencies: @types/node, typescript

7. Root `turbo.json` with pipeline configs
8. Root `.gitignore` for Node, Next.js, and IDE files
9. Root `README.md` with quick start instructions

Include all workspace linking. Use npm workspaces. Make sure all packages are properly cross-referenced.

---

## PROMPT 2: TypeScript & Config Files

Create TypeScript configuration files for the monorepo:

1. Root `tsconfig.json` with base config:
   - target: ES2022
   - module: commonjs
   - strict: true
   - esModuleInterop: true
   - skipLibCheck: true
   - moduleResolution: bundler

2. `apps/web/tsconfig.json` extending root:
   - Next.js specific settings
   - jsx: preserve
   - lib: dom, dom.iterable, esnext
   - paths: @/* mapped to src/*

3. `apps/api/tsconfig.json` extending root:
   - NestJS specific settings
   - decorators: experimental
   - emitDecoratorMetadata: true

4. `packages/shared/tsconfig.json` for shared types
5. `packages/providers/tsconfig.json` for provider layer

6. Create `.eslintrc.js` files for each workspace

7. Create `.prettierrc` with consistent formatting:
   - semi: true
   - singleQuote: true
   - tabWidth: 2
   - trailingComma: 'es5'

8. Create `.editorconfig` for consistent coding styles

---

## PROMPT 3: Docker Development Environment

Create Docker setup for local development:

1. Root `docker-compose.yml` with services:
   - postgres:15-alpine (port 5432)
     - environment: POSTGRES_DB=milebyclub, POSTGRES_USER=dev, POSTGRES_PASSWORD=devpass
     - volumes for persistence
   - redis:7-alpine (port 6379)
   - mailhog (ports 1025/8025) for email testing

2. Create `apps/api/Dockerfile` multi-stage build:
   - Stage 1: deps - install dependencies
   - Stage 2: builder - build application
   - Stage 3: runner - minimal production image

3. Create `apps/web/Dockerfile` for Next.js:
   - Multi-stage build
   - Standalone output
   - Node 20 alpine base

4. Root `Makefile` with commands:
   - `make dev` - start docker-compose and run dev servers
   - `make stop` - stop all services
   - `make clean` - clean all containers and volumes
   - `make logs` - tail all logs
   - `make db-reset` - reset database

5. `.env.example` files for both apps with all required variables

---

## PROMPT 4: Prisma Schema Foundation ✅ ALREADY COMPLETE

Database schema already built by Sonnet with:
- User, LoyaltyProgram, UserProgram models
- CreditCardCatalog, UserCard models
- 13+ complete models with proper relationships, indexes, and constraints
- Seed script with demo data

See: `packages/database/prisma/schema.prisma`

---

## PROMPT 5: Next.js Frontend Shell

Create the basic Next.js 14 app structure in `apps/web`:

1. `app/layout.tsx` with:
   - RootLayout component
   - Metadata exports
   - Inter font from next/font
   - Basic HTML structure with providers

2. `app/page.tsx` - landing page with hero section:
   - Headline: "Find Award Flight Deals Automatically"
   - Subheadline about monitoring programs
   - CTA button "Get Started"
   - Feature highlights (3 cards)

3. Create `app/globals.css` with Tailwind directives

4. Create `tailwind.config.ts` with:
   - Content paths
   - Theme extensions (colors, fonts)
   - Plugins

5. Create `lib/` folder structure:
   - `lib/utils.ts` with cn() helper (classnames merge)
   - `lib/api.ts` with fetch wrapper for API calls

6. Create `components/` folder:
   - `components/ui/` for shadcn components
   - `components/layout/` for Header, Footer
   - `components/shared/` for reusable components

7. Basic responsive Header component with logo and nav links

Keep it clean and minimal - just the shell. We'll add features later.

---

## PROMPT 6: NestJS API Foundation

Create the basic NestJS API structure in `apps/api`:

1. `src/main.ts` bootstrap file:
   - Enable CORS
   - Global validation pipe
   - Swagger setup on /api/docs
   - Port from env (default 3001)

2. `src/app.module.ts` root module:
   - Import ConfigModule (global)
   - Import PrismaModule
   - Import modules: AuthModule, UsersModule

3. Create `src/common/` folder:
   - `prisma/prisma.module.ts` and `prisma/prisma.service.ts`
   - `decorators/` for custom decorators
   - `guards/` for auth guards
   - `interceptors/` for logging
   - `filters/` for exception handling

4. Create `src/config/` folder:
   - `config.service.ts` for typed env variables
   - Validation using Zod

5. Create `src/users/` module:
   - users.module.ts
   - users.controller.ts (CRUD endpoints)
   - users.service.ts (Prisma integration)
   - dto/create-user.dto.ts (with class-validator)
   - dto/update-user.dto.ts
   - entities/user.entity.ts

6. Create `src/health/` module:
   - health.controller.ts with /health endpoint
   - Check database connection

Use dependency injection properly. Add proper error handling.

---

## PROMPT 7: NextAuth Setup

Set up authentication in `apps/web`:

1. Create `app/api/auth/[...nextauth]/route.ts`:
   - Google OAuth provider
   - Credentials provider (email/password)
   - JWT strategy
   - Callbacks for session and JWT

2. Create `lib/auth.ts`:
   - Auth options export
   - Session type definitions
   - Helper functions: getServerSession, requireAuth

3. Create `app/(auth)/login/page.tsx`:
   - Login form with email/password
   - Google sign-in button
   - Link to register page
   - Use React Hook Form + Zod validation

4. Create `app/(auth)/register/page.tsx`:
   - Registration form
   - Terms acceptance checkbox
   - Password requirements

5. Create `components/auth/`:
   - AuthProvider component (SessionProvider wrapper)
   - UserButton component (dropdown with profile/logout)
   - ProtectedRoute component

6. Create `middleware.ts` for route protection:
   - Protect /dashboard/* routes
   - Redirect to login if not authenticated

7. Add session type augmentation in `types/next-auth.d.ts`

Configure proper error handling and redirects.

---

## PROMPT 8: User Onboarding Flow

Create the onboarding flow in `apps/web/app/(dashboard)/onboarding/`:

1. `layout.tsx` - stepped progress indicator (4 steps)

2. `step1/page.tsx` - Home Airport Selection:
   - Autocomplete search for airports
   - Multi-select (can add multiple home airports)
   - Save to user profile button
   - "Skip for now" option

3. `step2/page.tsx` - Loyalty Programs:
   - Checkboxes for major airline programs (AA, Delta, United, etc.)
   - Checkboxes for hotel programs (Marriott, Hilton, Hyatt, etc.)
   - Optional member ID input fields
   - Status level dropdowns

4. `step3/page.tsx` - Credit Cards:
   - Visual grid of popular travel cards
   - Multi-select interface
   - "Add custom card" option
   - Link to "Why we ask" explanation

5. `step4/page.tsx` - Preferences:
   - Cabin preference (Economy, Premium Economy, Business, First)
   - Flexible dates toggle
   - Notification preferences checkboxes
   - Affiliate disclosure and consent checkbox
   - "Complete Setup" button

6. Create `lib/onboarding.ts`:
   - Progress state management
   - API calls to save each step
   - Validation helpers

7. Shared components in `components/onboarding/`:
   - StepIndicator
   - AirportAutocomplete
   - ProgramSelector
   - CardSelector

Make it responsive and accessible. Add proper loading states.

---

## PROMPT 9: Watcher Creation UI

Create the watcher/search creation interface in `apps/web/app/(dashboard)/watchers/`:

1. `new/page.tsx` - Watcher creation form:
   - Origin airport(s) selector (use saved home airports + option to add more)
   - Destination field (autocomplete or "Anywhere" option)
   - Date range picker with flex slider (±3 days, ±7 days, ±1 month)
   - Cabin preference selector
   - Number of passengers (1-9)
   - Program filter (which programs to check)
   - Frequency selector (Every 2hr, 6hr, 12hr, Daily)
   - "Create Watcher" button

2. `page.tsx` - Watcher list/dashboard:
   - Card grid of active watchers
   - Each card shows: route, dates, last checked, deal count
   - Edit/Delete/Pause buttons on each card
   - "Create New Watcher" FAB button
   - Empty state with helpful message

3. `[id]/page.tsx` - Individual watcher detail:
   - Watcher configuration display
   - Table of deals found (sortable)
   - Each deal: route, dates, points/cash, value (cpp), booking link
   - Deal filtering: by value, cabin, duration
   - Chart showing deal history over time

4. Create `components/watchers/`:
   - WatcherCard component
   - WatcherForm component
   - DealCard component
   - DealTable component
   - FlexDateSlider component

5. Create `lib/watchers.ts`:
   - API client functions
   - Type definitions
   - Validation schemas (Zod)

Use React Query for data fetching. Add optimistic updates for pause/delete.

---

## PROMPT 10: Basic Deal Display

Create deal display components in `apps/web`:

1. `components/deals/DealCard.tsx`:
   - Airline logo
   - Route display (origin → destination)
   - Dates
   - Points cost (large, prominent)
   - Cash cost equivalent
   - Value badge (cpp with color coding: green if >1.5, yellow if >1.0, gray if <1.0)
   - Loyalty program chip
   - "How to Book" button
   - "Save to Trip" button
   - Expand/collapse for details

2. `components/deals/DealDetails.tsx` (expanded view):
   - Flight segments breakdown
   - Transfer partner options
   - Taxes and fees breakdown
   - Booking instructions step-by-step
   - Alternative dates nearby
   - Price history mini-chart

3. `components/deals/ValueBadge.tsx`:
   - Colored badge based on cpp
   - Tooltip explaining calculation
   - Comparison to average value

4. `components/deals/HowToBookModal.tsx`:
   - Modal with step-by-step instructions
   - Transfer partner paths
   - Booking portal deep links
   - Copy-friendly format

5. `components/deals/DealFilters.tsx`:
   - Filter by cabin
   - Filter by minimum cpp value
   - Filter by max stops
   - Filter by program
   - Sort options

6. `lib/deals.ts`:
   - Type definitions for deals
   - Value calculation helpers
   - Formatting utilities (currency, dates, airports)

Use proper loading skeletons. Make cards interactive and responsive.

---

## PROMPT 11: Hotel Search Integration UI

Create hotel search and display in `apps/web`:

1. `app/(dashboard)/hotels/page.tsx`:
   - Destination search (autocomplete cities)
   - Date range picker
   - Guest count selector
   - Filter panel (price range, rating, amenities, loyalty programs)
   - Results grid with infinite scroll
   - Map view toggle

2. `components/hotels/HotelCard.tsx`:
   - Hotel image carousel
   - Star rating
   - Hotel name and location
   - Price per night (with affiliate badge)
   - Loyalty program badges
   - Free cancellation indicator
   - "View Details" button
   - Quick "Book Now" button

3. `components/hotels/HotelDetails.tsx` (modal or page):
   - Photo gallery
   - Full description
   - Amenities list with icons
   - Room types with pricing
   - Reviews summary
   - Location map
   - Affiliate booking link (clearly labeled)
   - "Add to Trip" button

4. `components/hotels/HotelFilters.tsx`:
   - Price range slider
   - Star rating filter
   - Amenities checkboxes (Pool, Gym, WiFi, etc.)
   - Loyalty program filter
   - Free cancellation toggle
   - Guest rating minimum

5. `components/hotels/HotelMap.tsx`:
   - Interactive map with hotel pins
   - Cluster handling for multiple hotels
   - Click to show hotel card
   - Sync with list view

6. `lib/hotels.ts`:
   - API client for hotel search
   - Type definitions
   - Filter/sort logic

Add proper loading states and error handling. Show affiliate disclosure.

---

## PROMPT 12: Activities & Experiences UI

Create activities search interface in `apps/web`:

1. `app/(dashboard)/activities/page.tsx`:
   - Location search
   - Date picker (single day or range)
   - Category filter (Tours, Food, Adventure, Culture, etc.)
   - Results list with cards
   - Filter sidebar

2. `components/activities/ActivityCard.tsx`:
   - Activity image
   - Title and brief description
   - Duration
   - Price
   - Rating and review count
   - Category badges
   - "View Details" button
   - "Add to Trip" button

3. `components/activities/ActivityDetails.tsx`:
   - Image gallery
   - Full description
   - What's included
   - Meeting point & pickup info
   - Cancellation policy
   - Available times/dates
   - Affiliate booking link
   - Reviews list

4. `components/activities/ActivityFilters.tsx`:
   - Category checkboxes
   - Price range slider
   - Duration filter
   - Rating minimum
   - Free cancellation toggle
   - Time of day filter

5. `components/shared/CategoryIcon.tsx`:
   - Icon mapping for activity categories
   - Use lucide-react icons

6. `lib/activities.ts`:
   - API client
   - Type definitions
   - Category constants

Keep interface consistent with hotels. Show affiliate disclosures.

---

## PROMPT 13: Trip Board / Itinerary

Create trip planning board in `apps/web/app/(dashboard)/trips/`:

1. `page.tsx` - Trip list:
   - Card grid of saved trips
   - Each card: destination, dates, thumbnail, flight/hotel status
   - Create new trip button
   - Empty state

2. `[id]/page.tsx` - Individual trip board:
   - Timeline view of trip days
   - Each day section:
     - Flight info (if applicable)
     - Hotel info
     - Activities list
     - Notes section
   - Add flight/hotel/activity buttons
   - Export options (Calendar, PDF, Share link)
   - Total cost summary

3. `components/trips/TripCard.tsx`:
   - Trip overview card
   - Thumbnail collage
   - Dates and destination
   - Status indicators
   - Quick actions

4. `components/trips/TripTimeline.tsx`:
   - Day-by-day timeline
   - Drag-and-drop reordering
   - Collapsible days
   - Add item to day

5. `components/trips/TripItem.tsx`:
   - Generic item for timeline (flight/hotel/activity)
   - Type-specific rendering
   - Remove button
   - Edit notes

6. `components/trips/AddToTripModal.tsx`:
   - Modal to add saved deals/hotels/activities to trip
   - Trip selector dropdown
   - Create new trip option

7. `lib/trips.ts`:
   - API client
   - Type definitions
   - Export logic (.ics generation)

Use drag-and-drop for reordering. Add share link generation with tokens.

---

## PROMPT 14: User Settings & Preferences

Create settings pages in `apps/web/app/(dashboard)/settings/`:

1. `layout.tsx` - Settings sidebar layout:
   - Navigation: Profile, Loyalty, Cards, Notifications, Privacy, Billing

2. `profile/page.tsx`:
   - Email (read-only, show auth provider)
   - Home airports management
   - Timezone selector
   - Language/locale selector
   - Account deletion button (with confirmation)

3. `loyalty/page.tsx`:
   - List of connected programs
   - Add/edit/remove programs
   - Member ID fields
   - Status level updates
   - Link to "Why we ask" info

4. `cards/page.tsx`:
   - List of user's credit cards
   - Add/edit/remove cards
   - Opening/closing dates
   - Notes field
   - Card suggestion consent toggle

5. `notifications/page.tsx`:
   - Email alerts toggle
   - Push notifications toggle
   - Frequency preference (Real-time, Daily digest, Weekly digest)
   - Deal threshold settings (min cpp value to notify)
   - Test notification button

6. `privacy/page.tsx`:
   - Data export button (download JSON)
   - Account deletion (with confirmation modal)
   - Consent toggles (affiliate suggestions, analytics)
   - Privacy policy link

7. `components/settings/`:
   - SettingSection component
   - ToggleSetting component
   - DangerZone component (for delete actions)

Use proper form validation. Add confirmation modals for destructive actions.

---

## PROMPT 15: Notification System UI

Create notification interface in `apps/web`:

1. `components/layout/NotificationBell.tsx` (in Header):
   - Bell icon with unread count badge
   - Click to open dropdown
   - List of recent notifications (max 5)
   - "View All" link
   - Mark as read on click

2. `app/(dashboard)/notifications/page.tsx`:
   - Full list of notifications
   - Filter: All, Unread, Flight Deals, Hotel Deals
   - Each notification card:
     - Icon (based on type)
     - Title and message
     - Timestamp
     - Link to relevant deal/trip
     - Mark as read/unread button
   - Mark all as read button
   - Pagination or infinite scroll

3. `components/notifications/NotificationCard.tsx`:
   - Type-specific styling
   - Unread indicator
   - Action buttons
   - Hover effects

4. `components/notifications/NotificationPreferences.tsx`:
   - Quick toggle panel
   - Appears in notification dropdown
   - Link to full settings

5. `lib/notifications.ts`:
   - API client for notifications
   - Type definitions
   - Push notification registration logic (for PWA)

6. Create `public/sw.js` service worker for push:
   - Basic push event handler
   - Notification click handler
   - VAPID setup placeholder

Add real-time updates using WebSocket or polling. Show inline preferences.

---

## PROMPT 16: Card Recommendation UI

Create credit card suggestion interface in `apps/web`:

1. `app/(dashboard)/cards/recommendations/page.tsx`:
   - Consent check (redirect if not consented)
   - Personalized card recommendations
   - Each recommendation card:
     - Card image
     - Card name and issuer
     - Why recommended (gap analysis)
     - Bonus offer details
     - Annual fee
     - Programs it unlocks
     - Affiliate CTA button
   - "Not interested" button (hides card)
   - Disclaimer footer

2. `components/cards/RecommendationCard.tsx`:
   - Card visual
   - Pros/cons list
   - "Why this card" explanation
   - Affiliate link button (clearly labeled)
   - Dismiss button

3. `components/cards/GapAnalysis.tsx`:
   - Visual showing user's current coverage
   - Highlighted gaps (e.g., "No Hyatt transfer partner")
   - How recommended card fills gap

4. `components/cards/CardComparison.tsx`:
   - Side-by-side comparison table
   - Multiple cards comparison
   - Feature checkmarks

5. `components/cards/ConsentBanner.tsx`:
   - Shown if user hasn't consented
   - Explain benefits of card recommendations
   - Affiliate disclosure
   - "Enable Recommendations" button

6. `lib/cards.ts`:
   - Recommendation algorithm logic
   - Gap analysis helpers
   - Type definitions

Always show clear affiliate disclosures. Never be pushy. Respect opt-out.

---

## PROMPT 17: Admin Dashboard Foundation

Create admin interface in `apps/web/app/(admin)/`:

1. `layout.tsx` - Admin layout:
   - Sidebar with admin nav
   - Role check (redirect if not admin)
   - Breadcrumbs

2. `dashboard/page.tsx` - Overview:
   - Stats cards: Total users, Active watchers, Deals found today, Revenue (estimated)
   - Recent user signups table
   - Recent affiliate clicks table
   - System health indicators

3. `users/page.tsx` - User management:
   - User table with search/filter
   - Columns: Email, Join date, Watchers count, Last active
   - Click to view user details
   - Export to CSV

4. `users/[id]/page.tsx` - User detail:
   - User info
   - Loyalty programs
   - Credit cards
   - Watchers list
   - Recent activity log
   - Admin actions (delete, suspend)

5. `settings/page.tsx` - Admin settings:
   - Feature flags table (toggle on/off)
   - Provider source toggles
   - Rate limit configurations
   - Email template preview

6. `components/admin/`:
   - StatCard component
   - DataTable component
   - FeatureFlagToggle component
   - UserActivityLog component

7. `lib/admin.ts`:
   - Admin API client
   - Permission checks
   - Type definitions

Add role-based access control. Log all admin actions.

---

## PROMPT 18: Analytics & Tracking

Create analytics tracking in `apps/web`:

1. `lib/analytics.ts`:
   - Event tracking functions
   - Server-side tracking only (privacy-first)
   - Events: signup, watcher_created, deal_clicked, affiliate_clicked, booking_completed
   - Properties: event metadata
   - Consent check before tracking

2. `app/api/events/route.ts`:
   - POST endpoint for analytics events
   - Validation with Zod
   - Store in database (AffiliateClick table)
   - Rate limiting

3. Add tracking to key components:
   - Deal card clicks
   - Affiliate link clicks
   - Booking button clicks
   - Search form submissions
   - Onboarding completions

4. `components/analytics/ConsentBanner.tsx`:
   - Cookie consent banner (if needed)
   - Explain what's tracked
   - Accept/Decline buttons
   - Link to privacy policy

5. `app/(dashboard)/insights/page.tsx` - User insights:
   - Personal stats (deals saved, searches created)
   - Value saved chart
   - Most searched destinations
   - Program utilization

6. `lib/tracking-context.tsx`:
   - React context for tracking
   - Consent state management
   - Helper hooks

Don't use third-party analytics. Keep it simple and privacy-focused.

---

## PROMPT 19: Mobile PWA Setup

Configure Progressive Web App in `apps/web`:

1. `app/manifest.ts` (Next.js 14 format):
   - name: "Mile Buy Club"
   - short_name: "MBC"
   - description
   - theme_color, background_color
   - display: "standalone"
   - icons: 192x192, 512x512
   - start_url: "/"

2. Update `app/layout.tsx`:
   - Add manifest link
   - Add theme-color meta
   - Add apple-touch-icon links

3. `public/icons/`:
   - Create placeholder icon files
   - icon-192.png
   - icon-512.png
   - apple-touch-icon.png

4. Update `public/sw.js` service worker:
   - Cache strategy for static assets
   - Offline page support
   - Background sync for failed requests

5. `components/pwa/InstallPrompt.tsx`:
   - Detect if PWA installable
   - Show install banner
   - Handle beforeinstallprompt event
   - Dismiss and don't show again option

6. `components/pwa/OfflineFallback.tsx`:
   - Shown when offline
   - Cached trips available
   - "Retry" button

7. Update `next.config.js`:
   - Add PWA config if using next-pwa plugin
   - Or manual service worker registration

Test on mobile devices. Ensure offline fallback works.

---

## PROMPT 20: Email Templates

Create email templates in `apps/api/src/templates/`:

1. `base.html` - Base email template:
   - Responsive HTML
   - Header with logo
   - Footer with unsubscribe link
   - Styling inline (for email clients)

2. `welcome.html` - Welcome email:
   - Greeting
   - Getting started steps
   - CTA to create first watcher
   - Support link

3. `deal-alert.html` - Deal notification:
   - Flight details
   - Value calculation
   - "View Deal" CTA button
   - How to book summary
   - "Manage alerts" link

4. `digest.html` - Daily/weekly digest:
   - Summary of new deals
   - Top 3 deals by value
   - Watcher status summary
   - "View all deals" CTA

5. `trip-reminder.html` - Trip reminder:
   - Trip itinerary summary
   - Countdown to trip
   - Checklist items
   - "View trip" CTA

6. Create email rendering service:
   - `src/email/email.service.ts`
   - Handlebars template engine
   - SES integration
   - Unsubscribe handling

7. `src/email/email.types.ts`:
   - Template data interfaces
   - Email types enum

Test emails with Mailhog. Ensure mobile-responsive.

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

## SONNET COMPLEX TASKS (Reference)

See SONNET_TASKS.md for:
- TASK 1: ✅ Complete Prisma Schema (DONE)
- TASK 2: ✅ Award Value Calculation Engine (DONE)
- TASK 3: Provider Abstraction Layer
- TASK 4: Background Job Scheduler
- TASK 5: Deal Ranking Algorithm
- TASK 6: Notification Delivery System
- TASK 7: Affiliate Tracking & Attribution
- TASK 8: Card Recommendation Engine
- TASK 9: Search Optimization & Caching
- TASK 10: Data Export & Privacy Compliance
- TASK 11: Admin Cost Dashboard
- TASK 12: Integration Test Harness

---

**Total: 25 Haiku Prompts + 12 Sonnet Tasks + Final Deployment Prompt = Complete Platform**
