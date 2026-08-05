# cocarr-notification-service

> Enterprise Notification Service.

Part of the **Cocarr Enterprise Platform** ([CoCarr-org](https://github.com/CoCarr-org)).

Topics: `notifications`, `email`, `push`, `sms`

## Purpose
Delivers transactional and campaign notifications across **email, SMS and push**,
with reusable templates (`{{var}}` interpolation) and a delivery record per send.
Sits behind the API Gateway at `/v1/notify/*`. It's the natural consumer of the
Identity service's device push tokens and the password/reset links produced by
Identity and Workspace.

## Channels
| Channel | Provider | Env |
|---|---|---|
| email | SendGrid | `SENDGRID_API_KEY`, `EMAIL_FROM` |
| sms | MSG91 | `MSG_KEY`, `MSG91_SENDER` |
| push | Firebase Cloud Messaging | `ADMIN_SERVICE_ACCOUNT` |

**Each channel SIMULATES when unconfigured** (logs + marks the record
`simulated`) so the service runs end-to-end in development without provider
accounts. A provider failure is **recorded** on the notification (status
`failed`) rather than thrown — the caller always gets the record and its status.

## Technology Stack
- Node.js + Express, Sequelize (MySQL)
- @sendgrid/mail, axios (MSG91), firebase-admin (FCM)
- express-validator, winston, swagger-ui-express

## Key endpoints
| Method | Path | What |
|---|---|---|
| GET | `/v1/health` | liveness + per-channel config status |
| GET | `/v1/docs` | Swagger UI |
| POST | `/v1/send` | send (`{ channel, to, templateKey?\|body, vars? }`) |
| POST | `/v1/notifications/send` | same (namespaced alias) |
| GET | `/v1/notifications` | delivery records (status, channel, principalId) |
| POST | `/v1/notifications/:id/retry` | re-attempt a failed send |
| CRUD | `/v1/templates` | message templates |

## Getting Started
```bash
git clone https://github.com/CoCarr-org/cocarr-notification-service.git
cd cocarr-notification-service && git checkout develop
cp .env.example .env && npm install && npm run dev   # :3070/v1/health, docs /v1/docs
```
With no provider keys set, sends succeed as `simulated` and are logged.

## Branch Strategy
`main` (protected) · `develop` (working) · `release`.

## Deployment
Docker + Railway (`railway.json`, healthcheck `/v1/health`) from `develop`.
Reached via `cocarr-api-gateway` (`/v1/notify`). See [`CLAUDE.md`](CLAUDE.md).

## License
[MIT](LICENSE).
