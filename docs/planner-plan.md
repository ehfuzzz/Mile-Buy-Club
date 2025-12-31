# Planner Plan API (Cache-Only)

`POST /planner/plan` evaluates flight award options using **only cached data** from the database. No third-party calls (e.g., SeatsAero partner API) occur during request handling; external polling happens in background jobs.

## Request

Body must satisfy `TripQuery`:
```json
{
  "origins": ["JFK"],
  "destinations": ["LHR"],
  "dateWindow": { "start": "2024-06-01", "end": "2024-06-07" },
  "cabin": "business",
  "passengers": 1,
  "maxStops": 1,
  "noRedeyes": false,
  "programs": ["aa"],
  "maxPoints": 80000,
  "allowStaleCache": false
}
```

Include the onboarding session header:
```
x-onboarding-session: <session-id>
```

## Responses

- **OK** (`type: "ok"`): Ranked options with constraint pass/fail details and cache freshness metadata.
- **Needs Input** (`type: "needs_input"`): Missing required fields or onboarding session.
- **No Feasible Plan** (`type: "no_feasible_plan"`): Cache empty/stale or constraints eliminate all options.

## Cache freshness

- The planner fails closed if the freshest cached record is older than the configured threshold (45 minutes) unless `allowStaleCache` is true. Stale results are returned with `verified: false`.

## Local testing

Seed cached deals (example using Prisma seed helpers) so the planner can return options:
```bash
# ensure the api app can reach your database with seats_aero_deals rows
npm run db:generate
npm run db:migrate
# run any existing SeatsAero collector job or insert rows into seats_aero_deals
```

Call the endpoint:
```bash
curl -i -X POST http://localhost:3001/planner/plan \
  -H "Content-Type: application/json" \
  -H "x-onboarding-session: <session-id>" \
  -d '{
    "origins":["JFK"],
    "destinations":["LHR"],
    "dateWindow":{"start":"2024-06-01","end":"2024-06-07"},
    "cabin":"business",
    "passengers":1
  }'
```

### Expected behaviors
- Missing cache rows → `type: "no_feasible_plan"` with `CACHE_EMPTY`.
- Stale cache (>45m) without `allowStaleCache` → `type: "no_feasible_plan"` with `CACHE_STALE`.
- With valid cached rows → ranked options derived solely from `seats_aero_deals`.
