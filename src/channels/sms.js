const axios = require('axios');
const Logger = require('../helper/logger');

// SMS via MSG91. Simulated when MSG_KEY / MSG91_SENDER are not set.
const isConfigured = () => Boolean(process.env.MSG_KEY);

async function send({ to, body }) {
  if (!isConfigured()) {
    Logger.warn(`[sms:simulated] to=${to} body="${(body || '').slice(0, 40)}"`);
    return { simulated: true };
  }
  const res = await axios.post('https://api.msg91.com/api/v5/flow/', {
    sender: process.env.MSG91_SENDER || 'COCARR',
    mobiles: to,
    message: body,
  }, { headers: { authkey: process.env.MSG_KEY, 'Content-Type': 'application/json' }, timeout: 8000 });
  return { id: res.data?.request_id || null };
}
module.exports = { isConfigured, send };
