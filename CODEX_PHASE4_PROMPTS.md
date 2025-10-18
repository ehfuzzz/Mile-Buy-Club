# Codex Phase 4 Tasks - Prompts 8, 9, 10, 14

**Date**: October 18, 2025  
**Status**: Ready for Codex execution  
**Dependencies**: ✅ All Phase 3 tasks completed (auth, PWA, notifications, ranking)

---

## 🎯 **MISSION OVERVIEW**

You are tasked with completing the remaining Phase 4 UI tasks for the Mile Buy Club application. These are the final 4 tasks needed to complete Phase 4 (UX Flows) and achieve 100% Phase 4 completion.

**All Phase 3 dependencies are resolved** - authentication, PWA, notifications, and deal ranking are fully implemented and ready to use.

---

## 📋 **TASKS TO COMPLETE**

### **PROMPT 8: Onboarding Flow**
- **Type**: UI Components + Forms
- **Dependencies**: ✅ Phase 3 auth complete
- **Files to create**: 4-5 files
- **Estimated time**: 1.5 hours

### **PROMPT 9: Watcher Creation UI**
- **Type**: UI Components + Forms + State Management
- **Dependencies**: ✅ Phase 3 auth complete
- **Files to create**: 5-6 files
- **Estimated time**: 2 hours

### **PROMPT 10: Deal Display**
- **Type**: UI Components + Filtering + Sorting
- **Dependencies**: ✅ Phase 3 ranking complete
- **Files to create**: 4-5 files
- **Estimated time**: 1.5 hours

### **PROMPT 14: User Settings**
- **Type**: UI Components + Forms + Preferences
- **Dependencies**: ✅ Phase 3 notifications complete
- **Files to create**: 3-4 files
- **Estimated time**: 1 hour

**Total estimated time**: 6 hours  
**Total files to create**: 16-20 files

---

## 🏗️ **PROJECT CONTEXT**

### **Repository Structure**
```
Mile Buy Club/
├── apps/web/
│   ├── app/
│   │   ├── (dashboard)/          # Dashboard routes
│   │   ├── api/                  # API routes
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   ├── hotels/               # Hotel-related components
│   │   ├── activities/           # Activity-related components
│   │   └── trip-board/           # Trip planning components
│   ├── lib/
│   │   ├── auth.ts               # Auth helpers (Phase 3)
│   │   ├── notifications/        # Notification client SDK (Phase 3)
│   │   ├── ranking-preview.ts    # Deal ranking adapter (Phase 3)
│   │   └── utils.ts
│   └── types/
│       └── next-auth.d.ts        # Auth types (Phase 3)
```

### **Available Dependencies**
- ✅ **NextAuth**: `getServerSession()`, `requireAuth()`, session management
- ✅ **Notifications**: `requestPermission()`, `subscribeToPush()`, `getUnreadCount()`
- ✅ **Deal Ranking**: `computeUiScore(deal)` for scoring deals
- ✅ **UI Components**: Button, form components from existing codebase
- ✅ **Styling**: Tailwind CSS with custom theme

### **Authentication Integration**
```typescript
// Use these auth helpers in your components
import { getServerSession, requireAuth } from '@/lib/auth';

// Server components
const session = await getServerSession();
const user = session?.user;

// Protected pages
await requireAuth(); // Redirects to /login if not authenticated
```

### **Notification Integration**
```typescript
// Use these notification helpers
import { 
  requestPermission, 
  subscribeToPush, 
  getUnreadCount,
  markAllRead 
} from '@/lib/notifications/client';
```

### **Deal Ranking Integration**
```typescript
// Use this for scoring deals
import { computeUiScore } from '@/lib/ranking-preview';

const score = computeUiScore({
  price: 500,
  cpp: 2.5,
  milesRequired: 25000,
  cabin: 'business',
  airline: 'United',
  createdAt: new Date()
});
// Returns 0-100 score
```

---

## 📝 **DETAILED TASK SPECIFICATIONS**

---

## **PROMPT 8: Onboarding Flow**

### **Objective**
Create a multi-step onboarding flow for new users to set up their preferences and get started with the platform.

### **Files to Create**
1. `apps/web/app/(dashboard)/onboarding/page.tsx` - Main onboarding page
2. `apps/web/components/onboarding/OnboardingStep.tsx` - Step wrapper component
3. `apps/web/components/onboarding/PreferencesForm.tsx` - User preferences form
4. `apps/web/components/onboarding/ProgramSelection.tsx` - Loyalty program selection
5. `apps/web/lib/onboarding.ts` - Onboarding utilities and types

### **Requirements**

#### **Step 1: Welcome & Introduction**
- Welcome message with app value proposition
- Brief explanation of how Mile Buy Club works
- "Get Started" button to proceed

#### **Step 2: Loyalty Program Selection**
- Multi-select interface for airline/hotel programs
- Popular programs: United, Delta, American, Southwest, Marriott, Hilton, etc.
- Search/filter functionality
- Visual program logos/icons
- "Continue" button (minimum 1 program required)

#### **Step 3: Travel Preferences**
- Home airport selection (searchable dropdown)
- Preferred cabin classes (Economy, Premium, Business, First)
- Travel frequency (Occasional, Regular, Frequent)
- Budget preferences (slider or range selection)
- "Continue" button

#### **Step 4: Notification Preferences**
- Email notifications toggle
- Push notifications toggle (use notification SDK)
- Digest frequency (Daily, Weekly, Never)
- Deal types to track (Flights, Hotels, Activities)
- "Continue" button

#### **Step 5: Complete Setup**
- Summary of selected preferences
- "Start Finding Deals" button
- Skip option for later setup

### **Technical Requirements**
- Use React Hook Form with Zod validation
- Responsive design (mobile-first)
- Progress indicator (1/5, 2/5, etc.)
- Step navigation (back/forward)
- Data persistence (localStorage + API)
- Integration with auth system
- TypeScript throughout

### **API Integration**
```typescript
// POST /api/user/preferences
interface UserPreferences {
  programs: string[];
  homeAirport: string;
  cabinPreferences: string[];
  travelFrequency: string;
  budgetRange: { min: number; max: number };
  notifications: {
    email: boolean;
    push: boolean;
    digestFrequency: string;
    dealTypes: string[];
  };
}
```

---

## **PROMPT 9: Watcher Creation UI**

### **Objective**
Create a comprehensive interface for users to create and manage deal watchers with advanced filtering options.

### **Files to Create**
1. `apps/web/app/(dashboard)/watchers/page.tsx` - Main watchers page
2. `apps/web/app/(dashboard)/watchers/create/page.tsx` - Create watcher page
3. `apps/web/components/watchers/WatcherForm.tsx` - Watcher creation form
4. `apps/web/components/watchers/WatcherCard.tsx` - Individual watcher display
5. `apps/web/components/watchers/WatcherFilters.tsx` - Advanced filtering
6. `apps/web/lib/watchers.ts` - Watcher utilities and types

### **Requirements**

#### **Watcher Creation Form**
- **Route Selection**:
  - Origin airport (searchable)
  - Destination airport (searchable)
  - Date range picker (flexible dates)
  - One-way vs round-trip toggle

- **Cabin & Passengers**:
  - Cabin class selection
  - Number of passengers (1-9)
  - Seat preferences

- **Deal Criteria**:
  - Maximum cash price (slider)
  - Minimum cents-per-point (CPP) threshold
  - Specific airlines (multi-select)
  - Exclude airlines (multi-select)
  - Blackout dates (calendar picker)

- **Advanced Filters**:
  - Layover preferences (direct, 1 stop, 2+ stops)
  - Departure time preferences (morning, afternoon, evening)
  - Specific aircraft types
  - Alliance preferences

- **Notification Settings**:
  - Email notifications toggle
  - Push notifications toggle
  - Notification frequency (immediate, hourly, daily)
  - Quiet hours (time range picker)

#### **Watcher Management**
- List of active watchers
- Edit/delete functionality
- Pause/resume watchers
- Watcher performance stats (deals found, last run)
- Bulk actions (pause all, delete selected)

#### **Watcher Display**
- Route summary (LAX → JFK, Dec 15-20)
- Current status (Active, Paused, Error)
- Last run time and results
- Quick actions (edit, pause, delete)
- Performance metrics

### **Technical Requirements**
- Form validation with Zod schemas
- Real-time form state management
- Integration with deal ranking system
- Responsive design
- Loading states and error handling
- Optimistic updates
- TypeScript throughout

### **API Integration**
```typescript
// POST /api/watchers
interface CreateWatcherRequest {
  name: string;
  route: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    isRoundTrip: boolean;
  };
  criteria: {
    maxPrice: number;
    minCpp: number;
    cabinClass: string;
    passengers: number;
    airlines: string[];
    excludeAirlines: string[];
    blackoutDates: string[];
  };
  filters: {
    maxStops: number;
    departureTime: string[];
    aircraftTypes: string[];
    alliances: string[];
  };
  notifications: {
    email: boolean;
    push: boolean;
    frequency: string;
    quietHours: { start: string; end: string };
  };
}
```

---

## **PROMPT 10: Deal Display**

### **Objective**
Create a comprehensive deal display interface with advanced filtering, sorting, and ranking capabilities.

### **Files to Create**
1. `apps/web/app/(dashboard)/deals/page.tsx` - Main deals page
2. `apps/web/components/deals/DealCard.tsx` - Individual deal display
3. `apps/web/components/deals/DealFilters.tsx` - Advanced filtering
4. `apps/web/components/deals/DealSorting.tsx` - Sorting controls
5. `apps/web/lib/deals.ts` - Deal utilities and types

### **Requirements**

#### **Deal Card Display**
- **Flight Information**:
  - Airline logo and name
  - Route (LAX → JFK)
  - Departure/arrival times
  - Flight duration
  - Stops (Direct, 1 stop, 2+ stops)
  - Aircraft type

- **Pricing & Value**:
  - Cash price (prominent display)
  - Miles required
  - Cents-per-point (CPP) calculation
  - Value score badge (use `computeUiScore`)
  - Savings vs cash price

- **Deal Quality Indicators**:
  - Value score (0-100) with color coding
  - "Hot Deal" badge for high-value deals
  - "Limited Time" badge for expiring deals
  - Star rating based on value

- **Actions**:
  - "View Details" button
  - "Book Now" button (affiliate link)
  - "Save Deal" button
  - "Share" button

#### **Filtering System**
- **Price Range**: Slider for cash price
- **Miles Range**: Slider for miles required
- **CPP Range**: Slider for cents-per-point
- **Airlines**: Multi-select with search
- **Cabin Class**: Checkboxes (Economy, Premium, Business, First)
- **Stops**: Radio buttons (Direct, 1 stop, 2+ stops)
- **Departure Time**: Time range picker
- **Value Score**: Slider for minimum score
- **Date Range**: Date picker for deal discovery

#### **Sorting Options**
- Best Value (default)
- Lowest Price
- Highest CPP
- Fewest Miles
- Departure Time
- Deal Age (newest first)
- Airline (alphabetical)

#### **View Options**
- Grid view (default)
- List view
- Map view (if applicable)
- Compact view

### **Technical Requirements**
- Integration with `computeUiScore` for ranking
- Real-time filtering and sorting
- Virtual scrolling for large datasets
- Responsive design
- Loading states and error handling
- TypeScript throughout

### **API Integration**
```typescript
// GET /api/deals
interface Deal {
  id: string;
  route: {
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
    duration: string;
    stops: number;
    airline: string;
    aircraft: string;
  };
  pricing: {
    cashPrice: number;
    milesRequired: number;
    cpp: number;
    savings: number;
  };
  value: {
    score: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    badges: string[];
  };
  metadata: {
    discoveredAt: string;
    expiresAt?: string;
    source: string;
    affiliateUrl: string;
  };
}
```

---

## **PROMPT 14: User Settings**

### **Objective**
Create a comprehensive user settings interface for managing account preferences, notifications, and privacy settings.

### **Files to Create**
1. `apps/web/app/(dashboard)/settings/page.tsx` - Main settings page
2. `apps/web/components/settings/NotificationSettings.tsx` - Notification preferences
3. `apps/web/components/settings/PrivacySettings.tsx` - Privacy and security
4. `apps/web/lib/settings.ts` - Settings utilities and types

### **Requirements**

#### **Account Settings**
- **Profile Information**:
  - Display name
  - Email address (read-only)
  - Profile picture upload
  - Bio/description

- **Account Security**:
  - Change password form
  - Two-factor authentication toggle
  - Login history
  - Active sessions management

#### **Notification Settings**
- **Email Notifications**:
  - Deal alerts toggle
  - Weekly digest toggle
  - Account updates toggle
  - Marketing emails toggle

- **Push Notifications**:
  - Browser notifications toggle (use notification SDK)
  - Mobile app notifications toggle
  - Sound preferences
  - Quiet hours (time range picker)

- **Notification Frequency**:
  - Immediate notifications
  - Hourly digest
  - Daily digest
  - Weekly digest

- **Deal Types**:
  - Flight deals toggle
  - Hotel deals toggle
  - Activity deals toggle
  - Card recommendations toggle

#### **Privacy Settings**
- **Data Sharing**:
  - Analytics data sharing toggle
  - Usage statistics toggle
  - Marketing data sharing toggle

- **Account Visibility**:
  - Public profile toggle
  - Show in leaderboards toggle
  - Anonymous mode toggle

#### **Preferences**
- **Display Settings**:
  - Theme selection (Light, Dark, Auto)
  - Language selection
  - Timezone selection
  - Date format preferences

- **Deal Preferences**:
  - Default sort order
  - Default view (grid/list)
  - Items per page
  - Auto-refresh interval

### **Technical Requirements**
- Integration with notification SDK
- Form validation with Zod
- Real-time preference updates
- Responsive design
- Loading states and error handling
- TypeScript throughout

### **API Integration**
```typescript
// PUT /api/user/settings
interface UserSettings {
  profile: {
    displayName: string;
    bio?: string;
    profilePicture?: string;
  };
  notifications: {
    email: {
      dealAlerts: boolean;
      weeklyDigest: boolean;
      accountUpdates: boolean;
      marketing: boolean;
    };
    push: {
      enabled: boolean;
      sound: boolean;
      quietHours: { start: string; end: string };
    };
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    dealTypes: {
      flights: boolean;
      hotels: boolean;
      activities: boolean;
      cards: boolean;
    };
  };
  privacy: {
    analytics: boolean;
    usageStats: boolean;
    marketing: boolean;
    publicProfile: boolean;
    leaderboards: boolean;
    anonymous: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    defaultSort: string;
    defaultView: 'grid' | 'list';
    itemsPerPage: number;
    autoRefresh: number;
  };
}
```

---

## 🛠️ **TECHNICAL GUIDELINES**

### **Code Standards**
- Use TypeScript for all files
- Follow Next.js 14 App Router patterns
- Use React Hook Form + Zod for form validation
- Implement proper error handling
- Use Tailwind CSS for styling
- Follow existing component patterns

### **File Naming Conventions**
- Components: PascalCase (`WatcherForm.tsx`)
- Pages: lowercase (`onboarding/page.tsx`)
- Utilities: camelCase (`watchers.ts`)
- Types: PascalCase interfaces

### **Import Patterns**
```typescript
// External libraries
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Internal components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Utilities and types
import { cn } from '@/lib/utils';
import { computeUiScore } from '@/lib/ranking-preview';

// Auth helpers
import { getServerSession } from '@/lib/auth';
```

### **Component Structure**
```typescript
interface ComponentProps {
  // Props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState();
  
  // Handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
}
```

---

## 🚀 **EXECUTION INSTRUCTIONS**

### **Step 1: Setup**
1. Clone the repository: `git clone https://github.com/ehfuzzz/Mile-Buy-Club.git`
2. Install dependencies: `npm install`
3. Create a new branch: `git checkout -b codex-phase4-tasks`

### **Step 2: Implementation Order**
1. **Start with PROMPT 8** (Onboarding) - simplest, good warmup
2. **Then PROMPT 14** (Settings) - straightforward forms
3. **Then PROMPT 10** (Deal Display) - more complex UI
4. **Finish with PROMPT 9** (Watcher Creation) - most complex

### **Step 3: Testing**
- Test each component individually
- Verify form validation works
- Check responsive design
- Test integration with existing auth/notifications

### **Step 4: Submission**
- Commit each prompt separately
- Push to your branch
- Create pull request with detailed description

---

## 📞 **SUPPORT & QUESTIONS**

If you have questions about:
- **Existing codebase**: Check the current files in the repository
- **Authentication**: Reference `apps/web/lib/auth.ts`
- **Notifications**: Reference `apps/web/lib/notifications/`
- **Deal ranking**: Reference `apps/web/lib/ranking-preview.ts`
- **UI components**: Reference `apps/web/components/ui/`

---

## 🎯 **SUCCESS CRITERIA**

Your implementation will be considered successful if:
- ✅ All 4 prompts are completed
- ✅ All files compile without TypeScript errors
- ✅ Components integrate properly with existing auth/notifications
- ✅ Forms have proper validation and error handling
- ✅ UI is responsive and follows design patterns
- ✅ Code follows established patterns and conventions
- ✅ All acceptance criteria are met

---

**Ready to start building! 🚀**

**Repository**: https://github.com/ehfuzzz/Mile-Buy-Club  
**Branch**: `main` (latest with all Phase 3 completed)  
**Dependencies**: ✅ All resolved and ready to use
