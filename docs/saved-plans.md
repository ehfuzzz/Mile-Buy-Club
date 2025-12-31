# Saved Plans API

The saved plans feature captures the exact plan shown to a user (query, selected option snapshot, provenance) using only cached data.

## Endpoints

- `POST /planner/plans` – Save a plan snapshot for the current onboarding session (requires `x-onboarding-session`).
- `GET /planner/plans` – List saved plans for the session.
- `GET /planner/plans/:id` – Fetch a full saved plan plus current cache freshness (cache-only).
- `POST /planner/plans/:id/public` – Make a plan public and rotate a share token.
- `POST /planner/plans/:id/revoke` – Revoke public access.
- `GET /share/plans/:token` – Public, read-only access via share token (no session ID returned).

> Note: All planner persistence uses cached data only; there are **no third-party award API calls** in these endpoints.

## Example requests

### Save a plan
```bash
curl -X POST http://localhost:3001/planner/plans \
  -H "Content-Type: application/json" \
  -H "x-onboarding-session: <session-id>" \
  -d '{
    "query": {"origins":["JFK"],"destinations":["LHR"],"dateWindow":{"start":"2024-01-01","end":"2024-01-10"},"cabin":"business","passengers":1},
    "selectedOption": <RankedOption from /planner/plan>,
    "title": "Holiday",
    "makePublic": true
  }'
```

### List plans
```bash
curl -H "x-onboarding-session: <session-id>" http://localhost:3001/planner/plans
```

### Get a plan with cache status
```bash
curl -H "x-onboarding-session: <session-id>" http://localhost:3001/planner/plans/<id>
```

### Share and revoke
```bash
curl -X POST -H "x-onboarding-session: <session-id>" http://localhost:3001/planner/plans/<id>/public
curl -X POST -H "x-onboarding-session: <session-id>" http://localhost:3001/planner/plans/<id>/revoke
```

### Public fetch
```bash
curl http://localhost:3001/share/plans/<share-token>
```

## Response shape highlights
- `save` responses include `{ id, shareUrl?, savedPlan }`.
- `list` responses return plan summaries including `query` and `provenance`.
- `get` responses include `currentCacheStatus` with `{ freshestAt?, stale }`.
- Public `share` responses omit the real `sessionId` to avoid PII.
