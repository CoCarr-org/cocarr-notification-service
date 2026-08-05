const Logger = require('../helper/logger');

// Email via SendGrid. If SENDGRID_API_KEY is unset, SIMULATE (log + succeed) so
// the service is usable in dev without a provider account.
let sg = null;
if (process.env.SENDGRID_API_KEY) {
  // eslint-disable-next-line global-require
  sg = require('@sendgrid/mail');
  sg.setApiKey(process.env.SENDGRID_API_KEY);
}
const isConfigured = () => Boolean(sg);

async function send({ to, subject, body }) {
  if (!sg) {
    Logger.warn(`[email:simulated] to=${to} subject="${subject}"`);
    return { simulated: true };
  }
  const [res] = await sg.send({
    to,
    from: process.env.EMAIL_FROM || 'no-reply@cocarr.com',
    subject: subject || '(no subject)',
    html: body,
  });
  return { id: res?.headers?.['x-message-id'] || null };
}
module.exports = { isConfigured, send };
