const db = require('../configs/db');
const { authMode } = require('../helper/authMode');
const channels = require('../channels');
async function health(req, res) {
  let dbOk = false;
  try { await db.authenticate(); dbOk = true; } catch (_) { dbOk = false; }
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    service: 'cocarr-notification-service',
    db: dbOk,
    auth: authMode(),
    channels: { email: channels.email.isConfigured(), sms: channels.sms.isConfigured(), push: channels.push.isConfigured() },
    time: new Date().toISOString(),
  });
}
module.exports = { health };
