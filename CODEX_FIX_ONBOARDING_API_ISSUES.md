# Fix Onboarding Page API Issues

## Problem Statement

The onboarding page at `/onboarding` is currently experiencing two critical issues:

1. ❌ **"Failed to fetch" errors** - API calls are failing
2. ❌ **"Loading conversation..." stuck state** - The page never loads the initial chat question

## Root Cause Analysis

After investigation, we've identified **two critical issues** that need to be fixed:

### Issue 1: Missing `api.patch()` Method

**Location**: `apps/web/lib/api.ts`

**Problem**: The onboarding page calls `api.patch()` on line 178 of `apps/web/app/onboarding/page.tsx` to save user profile updates, but the `patch` method does not exist in the API wrapper.

**Current Code** (`apps/web/lib/api.ts` lines 56-74):
```typescript
export const api = {
  get: <T,>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'GET' }),
  
  post: <T,>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  
  put: <T,>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  
  delete: <T,>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
};
```

**Required Fix**: Add the `patch` method between `put` and `delete`:

```typescript
export const api = {
  get: <T,>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'GET' }),
  
  post: <T,>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  
  put: <T,>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  
  patch: <T,>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  
  delete: <T,>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
};
```

### Issue 2: Environment Variable Configuration

**Location**: `apps/web/.env.local`

**Problem**: This file is in `.gitignore`, so it won't be in the repository. However, the application requires these environment variables to be set for the frontend to connect to the backend API.

**Current Expected Variables**:
- `NEXT_PUBLIC_API_URL` - The backend API URL (should be `http://localhost:3001` for local development)
- `NEXT_PUBLIC_DEMO_USER_ID` - A valid demo user ID from the database

**Solution**: Update the `.env.local.example` file (or create one if it doesn't exist) to document these required variables:

**File**: `apps/web/.env.local.example`
```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Demo user ID for onboarding (replace with actual user ID from database)
NEXT_PUBLIC_DEMO_USER_ID=cmgx7c3mc000013ylf90bwphb
```

**Important Note**: After pulling these changes, developers will need to:
1. Copy `.env.local.example` to `.env.local`
2. Replace `NEXT_PUBLIC_DEMO_USER_ID` with a valid user ID from their local database (or use the provided demo user ID if it exists in their database)

## Required Changes

### 1. Fix `apps/web/lib/api.ts`

Add the `patch` method to the `api` export object.

### 2. Create or Update `apps/web/.env.local.example`

Document the required environment variables so developers know what to configure.

### 3. Update Documentation (Optional but Recommended)

Add a note in `BUILD_INSTRUCTIONS.md` or `README.md` about setting up the frontend environment variables:

```markdown
### Frontend Environment Variables

Copy the example environment file and configure it:

```bash
cd apps/web
cp .env.local.example .env.local
```

Then edit `.env.local` and set:
- `NEXT_PUBLIC_API_URL`: The backend API URL (default: `http://localhost:3001`)
- `NEXT_PUBLIC_DEMO_USER_ID`: A valid user ID from your database (create a demo user first if needed)
```

## Testing After Changes

After making these changes, test the onboarding page:

1. **Start the backend**:
   ```bash
   cd apps/api
   npm run build
   node dist/main.js
   ```

2. **Start the frontend**:
   ```bash
   cd apps/web
   npm run dev
   ```

3. **Visit the onboarding page**:
   Open http://localhost:3000/onboarding in your browser

4. **Expected Behavior**:
   - ✅ Page loads with "Travel Intake Chat" header
   - ✅ First question appears automatically: "Great to meet you! Where do you typically depart from?"
   - ✅ Input field is enabled and functional
   - ✅ You can answer all 5 questions
   - ✅ After answering all questions, the AI extracts your travel preferences
   - ✅ Profile summary appears at the bottom as editable chips
   - ✅ NO "Failed to fetch" errors
   - ✅ NO "Loading conversation..." stuck state

## Additional Context

### Why This Is Critical

The onboarding page is the **first interaction** users have with the application. It uses an LLM-powered conversation to extract user travel preferences, which are then used to personalize flight deals and recommendations.

Without these fixes:
- Users cannot complete onboarding
- Travel preferences cannot be saved
- The application cannot provide personalized recommendations

### Related Files

- `apps/web/app/onboarding/page.tsx` - The onboarding page component
- `apps/web/lib/api.ts` - The API wrapper (needs `patch` method)
- `apps/web/.env.local` - Local environment variables (not in git, needs example file)
- `apps/api/src/onboarding/onboarding.controller.ts` - Backend onboarding endpoints
- `apps/api/src/onboarding/onboarding.service.ts` - Backend onboarding service (uses OpenAI for profile extraction)

### Backend API Endpoints Used by Onboarding

1. `POST /onboarding/session` - Creates a new onboarding session
2. `POST /onboarding/message` - Saves a message to the conversation
3. `POST /onboarding/extract` - Extracts user profile from conversation using LLM
4. `GET /profile?userId={userId}` - Retrieves user profile
5. `PATCH /profile?userId={userId}` - Updates user profile (**requires `api.patch()` method**)

## Summary

**Two simple fixes are required**:

1. ✅ Add `api.patch()` method to `apps/web/lib/api.ts`
2. ✅ Create `apps/web/.env.local.example` to document required environment variables

These changes will fix the "Failed to fetch" and "Loading conversation..." errors on the onboarding page.

