# SeatsAero Integration Debug Prompt for Codex

## Problem Statement

The Mile Buy Club application has a SeatsAero integration that is not working properly. The backend API is successfully calling the SeatsAero API and receiving real flight data, but the frontend is not displaying the deals. Instead, it's falling back to an empty database.

## Current Status

✅ **Working Components:**
- Backend API is running on port 3001
- SeatsAero API is responding with real flight data (confirmed via direct API calls)
- Database is connected and working
- Frontend is running on port 3003
- SeatsAero API key is configured: `pro_34GoHwfqK5fP3esJgqAhxv4cOmj`

❌ **Issue:**
- `/deals` endpoint returns 0 deals
- Response shows `userId: "cmgx7c3mc000013ylf90bwphb"` (database user ID)
- Should show `userId: "seats-aero"` when SeatsAero data is working
- Frontend displays "No deals match the current filters"

## Technical Context

### API Response Structure
When SeatsAero integration works, the response should be:
```json
{
  "deals": [...],
  "meta": {
    "total": X,
    "userId": "seats-aero",
    "watcherCount": Y
  }
}
```

Currently getting:
```json
{
  "deals": [],
  "meta": {
    "total": 0,
    "userId": "cmgx7c3mc000013ylf90bwphb",
    "watcherCount": 0
  }
}
```

### Key Files

1. **Backend Service:** `apps/api/src/deals/deals.service.ts`
   - `listDeals()` method calls SeatsAero service
   - Falls back to `listDealsFromDatabase()` on error
   - Current implementation has try-catch that masks the real error

2. **SeatsAero Service:** `apps/api/src/deals/seats-aero-partner.service.ts`
   - `search()` method calls SeatsAero API
   - Uses `/availability` endpoint for bulk data
   - `mapAvailabilityToDeal()` transforms API response to internal format

3. **Controller:** `apps/api/src/deals/deals.controller.ts`
   - Simple endpoint that calls the service

### SeatsAero API Details

- **Base URL:** `https://seats.aero/partnerapi`
- **Endpoint:** `/availability?source=united&take=1`
- **Headers:** `Partner-Authorization: pro_34GoHwfqK5fP3esJgqAhxv4cOmj`
- **Response:** Returns real flight data (confirmed working)

### Environment Configuration

```bash
SEATS_AERO_API_KEY=pro_34GoHwfqK5fP3esJgqAhxv4cOmj
SEATS_AERO_BASE_URL=https://seats.aero/partnerapi
SEATS_AERO_TIMEOUT_MS=20000
SEATS_AERO_RPM=30
SEATS_AERO_RPH=500
```

## Debugging Steps Needed

1. **Identify the Root Cause**
   - The SeatsAero service is being called but throwing an error
   - Need to identify what error is occurring in the mapping process
   - The try-catch in `listDeals()` is masking the real error

2. **Fix the Error Handling**
   - Remove or modify the try-catch to see the actual error
   - Add proper logging to identify where the failure occurs
   - Ensure SeatsAero service errors are properly handled

3. **Test the Integration**
   - Verify SeatsAero API calls are working
   - Test the data mapping from SeatsAero response to internal format
   - Ensure the frontend receives the mapped data

## Specific Areas to Investigate

1. **Data Mapping Issues**
   - `mapAvailabilityToDeal()` method might be throwing errors
   - Type mismatches between SeatsAero response and internal types
   - Missing or incorrect field mappings

2. **Service Initialization**
   - SeatsAeroPartnerService constructor might have issues
   - HTTP client configuration problems
   - API key or headers not being set correctly

3. **Error Propagation**
   - Errors are being caught and swallowed somewhere
   - Need to trace the error flow through the service chain

## Expected Outcome

After debugging, the application should:
1. Successfully call SeatsAero API
2. Map the response data correctly
3. Return deals with `userId: "seats-aero"`
4. Display real flight deals in the frontend

## Test Commands

```bash
# Test SeatsAero API directly
curl -H "Partner-Authorization: pro_34GoHwfqK5fP3esJgqAhxv4cOmj" \
     -H "Accept: application/json" \
     "https://seats.aero/partnerapi/availability?source=united&take=1"

# Test backend deals endpoint
curl -s http://localhost:3001/deals | jq '.meta'

# Check if backend is running
curl -s http://localhost:3001/health
```

## Priority

This is a **high priority** issue as it prevents the core functionality of the application from working. The SeatsAero integration is the primary feature for displaying real flight deals to users.

---

**Please debug this issue and provide a working solution that displays real SeatsAero flight deals in the frontend.**
