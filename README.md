# Mile Buy Club

> Find Award Flight Deals Automatically

A comprehensive platform for monitoring flight availability, discovering travel deals, and planning trips using loyalty points and miles.

## Quick Start

### Prerequisites

- Node.js 20+ 
- npm 10+
- Docker & Docker Compose (for local development)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start local development environment
docker-compose up -d

# Run database migrations
npm run db:push

# Start development servers
npm run dev
```

Access the application:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Database Studio**: Run `npm run db:studio`

## Architecture

### Monorepo Structure

```
mile-buy-club/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── database/     # Prisma ORM & schema
│   ├── shared/       # Shared types & utilities
│   └── providers/    # Flight/Hotel/Activity integrations
├── docker-compose.yml
├── Makefile
└── turbo.json       # Build orchestration
```

### Tech Stack

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- React Query
- NextAuth

**Backend:**
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis

**Infrastructure:**
- Docker & Docker Compose
- Turborepo
- ESLint & Prettier

### Flight Provider Capabilities

The stack now supports both award searches _and_ cash fares:

- **SeatsAero** and **Point.Me** surface real-time award inventory with miles, taxes/fees, and segment metadata. Each provider also publishes an estimated *points + cash* blend so travelers can see how much cash would be due if they offset a portion of the miles.
- **Kiwi (Tequila API)** delivers paid inventory, including historically cheap cash fares, cabin data, and deep links for booking.

Watcher jobs merge these sources into unified deals with detailed pricing options (award-only, points + cash, and full cash) so users without large mileage balances can still act on attractive bargains. Each watcher run now evaluates every pricing path independently and cross-checks seat availability—expired or sold-out itineraries are removed automatically so only live inventory triggers alerts.

## Available Commands

```bash
# Development
npm run dev              # Start all dev servers
npm run build            # Build all apps
npm run lint             # Lint all packages
npm run format           # Format all code
npm run test             # Run tests
npm run clean            # Clean all build artifacts

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio

# Workspace-specific (add --scope=@mile/web or @mile/api)
npm run dev --scope=@mile/web    # Dev just frontend
npm run build --scope=@mile/api  # Build just backend
```

## Project Phases

### Phase 1: ✅ Foundation & Configuration
- Monorepo setup with Turborepo
- TypeScript & ESLint configuration
- Docker development environment

### Phase 2: ✅ Backend Infrastructure
- NestJS API foundation
- Prisma database schema
- Provider abstraction layer
- Background job scheduler

### Phase 3: ✅ Frontend Architecture
- Next.js & NextAuth setup
- PWA configuration
- Notification system

### Phase 4: ✅ User Experience
- Onboarding flow
- Watcher/search creation
- Deal display & filtering
- Trip planning board

### Phase 5: 🚧 Production Ready (in progress)
- ✅ Card recommendation UI
- ✅ Admin dashboard
- ✅ Email templates
- ✅ Error handling & validation UX
- ✅ Rate limiting controls
- ✅ Logging & monitoring
- ✅ Security hardening
- ☐ Caching & search optimization
- ☐ Privacy & GDPR compliance
- ☐ Admin cost dashboard
- ☐ Integration test harness
- ☐ Testing suite

## Contributing

Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details on code style and git workflow.

## Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Architecture](docs/ARCHITECTURE.md) - System design & decisions
- [API Documentation](docs/API.md) - Endpoint specs
- [Project Roadmap](PROJECT_PLAN.md) - Build sequence

## License

MIT

## Support

For questions or issues, please open a GitHub issue or contact the team.

---

**Status**: Early Development (MVP Phase)
