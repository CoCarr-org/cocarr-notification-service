const { CustomError } = require('../middlewares/error');
const { Notification } = require('../models');
const channels = require('../channels');
const templateService = require('./templateService');

// Send a notification. Either provide { templateKey, vars } or { subject, body }.
// The delivery is always RECORDED — a provider failure is captured on the row
// (status 'failed') rather than thrown, so callers get the record and status.
async function send({ channel, to, templateKey, vars, subject, body, data, principalId }) {
  if (!to) throw new CustomError('`to` (recipient) is required', 400, 'VALIDATION_ERROR');

  let resolvedChannel = channel;
  let s = subject;
  let b = body;
  if (templateKey) {
    const t = await templateService.renderByKey(templateKey, vars || {});
    s = subject || t.subject;
    b = body || t.body;
    if (!resolvedChannel && t.channel !== 'any') resolvedChannel = t.channel;
  }
  if (!resolvedChannel) throw new CustomError('`channel` is required (email|sms|push)', 400, 'VALIDATION_ERROR');
  if (!channels[resolvedChannel]) throw new CustomError(`Unknown channel '${resolvedChannel}'`, 400, 'VALIDATION_ERROR');
  if (!b) throw new CustomError('`body` or `templateKey` is required', 400, 'VALIDATION_ERROR');

  const notif = await Notification.create({
    channel: resolvedChannel, to, principalId: principalId || null,
    templateKey: templateKey || null, subject: s || null, body: b, data: data || null, status: 'queued',
  });

  try {
    const result = await channels[resolvedChannel].send({ to, subject: s, body: b, data });
    await notif.update({ status: result.simulated ? 'simulated' : 'sent', providerId: result.id || null, sentAt: new Date() });
  } catch (e) {
    await notif.update({ status: 'failed', error: String(e.message).slice(0, 250) });
  }
  return notif.reload();
}

async function list({ status, channel, principalId, offset = 0, limit = 25 } = {}) {
  const where = {};
  if (status) where.status = status;
  if (channel) where.channel = channel;
  if (principalId) where.principalId = principalId;
  const data = await Notification.findAll({ where, order: [['createdAt', 'DESC']], offset: parseInt(offset, 10) || 0, limit: parseInt(limit, 10) || 25 });
  return { data, totalCount: await Notification.count({ where }) };
}

async function getById(id) {
  const n = await Notification.findByPk(id);
  if (!n) throw new CustomError('Notification not found', 404, 'NOT_FOUND');
  return n;
}

// Re-attempt a previously failed notification.
async function retry(id) {
  const n = await getById(id);
  return send({
    channel: n.channel, to: n.to, subject: n.subject, body: n.body,
    data: n.data, principalId: n.principalId,
  });
}

module.exports = { send, list, getById, retry };
