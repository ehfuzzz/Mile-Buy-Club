# Onboarding API Debug Notes

Use these commands when updating the onboarding data model or reproducing issues locally:

- `npx prisma generate`
- `npx prisma db push`

Example cURL flows (adjust host/port as needed):

```bash
# Start or resume a session
curl -i -X POST http://localhost:3001/onboarding/session -H "Content-Type: application/json" -d '{"userId":"demo-user"}'

# Fetch state (include the onboarding_session cookie returned above)
curl -i --cookie "onboarding_session=<sessionId>" http://localhost:3001/onboarding/state

# Apply a deterministic state patch
curl -i --cookie "onboarding_session=<sessionId>" \
  -H "Content-Type: application/json" \
  -d '{"baseVersion":1,"ops":[{"op":"set","path":"/travelPrefs/homeAirports","value":["JFK"]}]}' \
  http://localhost:3001/onboarding/state/patch
```

Each API response and log line includes a `requestId` to correlate failures with server logs.
