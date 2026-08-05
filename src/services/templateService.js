const { createCrudService } = require('./crudFactory');
const { CustomError } = require('../middlewares/error');
const { Template } = require('../models');
const { render } = require('../utils/render');

const crud = createCrudService({
  model: Template, entityType: 'Template', searchable: ['key', 'name'],
  allowed: ['key', 'name', 'channel', 'subject', 'body', 'isActive'],
});

// Resolve a template by key and interpolate vars.
async function renderByKey(key, vars) {
  const t = await Template.findOne({ where: { key, isActive: true } });
  if (!t) throw new CustomError(`Template '${key}' not found`, 404, 'NOT_FOUND');
  return { channel: t.channel, subject: render(t.subject, vars), body: render(t.body, vars) };
}
module.exports = { ...crud, renderByKey };
