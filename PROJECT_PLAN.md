# Mile Buy Club - Build Sequence

## Overview
This document outlines the build sequence for the Mile Buy Club trip-planning platform. Follow the prompts in order, feeding each to Claude Haiku 4.5.

## Architecture
```
Mile Buy Club/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── providers/    # Integration adapters
│   ├── database/     # Prisma schema & migrations
│   ├── shared/       # Shared types & utils
│   └── config/       # Shared configs
├── infrastructure/   # Docker, Terraform
└── docs/            # Documentation
```

## Build Phases

### Phase 1: Foundation (Prompts 1-5)
- Monorepo setup
- Database schema
- Auth foundation
- Basic API structure
- Basic frontend shell

### Phase 2: Core Search (Prompts 6-10)
- Watcher creation
- Provider abstraction layer
- Value calculation engine
- Deal ranking
- Search UI components

### Phase 3: Integrations (Prompts 11-15)
- Hotel provider adapters
- Activity provider adapters
- Email/notification system
- Affiliate tracking
- Card suggestion engine

### Phase 4: User Experience (Prompts 16-20)
- Trip board
- Alert preferences
- Settings & privacy controls
- Onboarding flow
- Mobile PWA setup

### Phase 5: Production Ready (Prompts 21-25)
- Admin dashboard
- Cost controls & rate limiting
- Monitoring & logging
- Security hardening
- Testing suite

---

## Status Tracking
- [ ] Phase 1: Foundation
- [ ] Phase 2: Core Search
- [ ] Phase 3: Integrations
- [ ] Phase 4: User Experience
- [ ] Phase 5: Production Ready
