const fb = require('../helper/firebaseAdmin');
const Logger = require('../helper/logger');

// Push via Firebase Cloud Messaging. Simulated when Firebase is unconfigured.
// `to` is the device push token (from the Identity service's device records).
const isConfigured = () => fb.isConfigured();

async function send({ to, subject, body, data }) {
  if (!isConfigured()) {
    Logger.warn(`[push:simulated] to=${to} title="${subject}"`);
    return { simulated: true };
  }
  const id = await fb.messaging().send({
    token: to,
    notification: { title: subject || 'Cocarr', body: body || '' },
    data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined,
  });
  return { id };
}
module.exports = { isConfigured, send };
