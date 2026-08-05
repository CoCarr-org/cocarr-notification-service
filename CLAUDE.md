# cocarr-notification-service

Express + Sequelize (MySQL) service for email/SMS/push delivery. Mirrors the
other services' conventions. **Working branch: `develop`.** Port **3070**.
Gateway upstream: `/v1/notify`.

## How sending works
`notificationService.send({ channel, to, templateKey?|body, vars?, data?, principalId? })`:
1. If `templateKey`, resolve the template and interpolate `{{var}}` with `vars`.
2. Persist a `notification` row (`status: queued`).
3. Dispatch via the channel adapter, then update the row to `sent`,
   `simulated`, or `failed`. **A provider error is recorded, not thrown** — the
   caller gets the record and its status.

## Channels simulate when unconfigured
`src/channels/{email,sms,push}.js` each expose `isConfigured()` + `send()`. With
no provider env set they log and return `{ simulated: true }`, and the record's
status becomes `simulated`. This is why the whole flow works in dev without any
provider account. `/v1/health` reports which channels are live.
- email → SendGrid (`SENDGRID_API_KEY`)
- sms → MSG91 (`MSG_KEY`) via axios
- push → FCM (`ADMIN_SERVICE_ACCOUNT`); `to` is a device push token from the
  Identity service's device records.

## Routing note
`/v1/send` (root) and `/v1/notifications/send` both send. The root one exists so
the gateway path `/v1/notify/send` maps cleanly (gateway rewrites `/v1/notify/*`
→ `/v1/*`).

## Not done yet (deferred)
- **Preferences** (per-principal channel opt-in/out) — add a `preference` model
  and check it before dispatch.
- **Async queue / retries with backoff** — sends are synchronous today; a queue
  (BullMQ/SQS) + scheduled retry would harden delivery. `retry` is manual now.
- **Bulk/campaign send**, delivery webhooks (provider status callbacks),
  rate limiting per recipient, tests.
- The DB defaults to `cocarr_core` in `.env.example` (delivery records can live
  with core, or give it its own database).

## Verified
Syntax-clean; require graph loads; live HTTP smoke test (health with channel
status, `/v1/send` + `/v1/notifications/send` routes, validation 400, templates
route, 404) with the DB intentionally unreachable. Full send/persist path needs
a MySQL instance — see cocarr-devops compose.
