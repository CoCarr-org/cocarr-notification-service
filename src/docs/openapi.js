module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Cocarr Notification Service',
    version: '0.1.0',
    description: 'Email / SMS / Push delivery with templates ({{var}}) and delivery records. '
      + 'Channel providers (SendGrid, MSG91, FCM) are simulated when unconfigured.',
  },
  servers: [{ url: '/v1' }],
  tags: [{ name: 'Notifications' }, { name: 'Templates' }, { name: 'Health' }],
  paths: {
    '/health': { get: { tags: ['Health'], summary: 'Liveness + channel config status', responses: { 200: { description: 'ok' } } } },
    '/notifications/send': { post: { tags: ['Notifications'], summary: 'Send ({ channel, to, templateKey?|body, vars? })', responses: { 201: { description: 'recorded' } } } },
    '/notifications': { get: { tags: ['Notifications'], summary: 'List delivery records (status, channel, principalId)', responses: { 200: { description: 'ok' } } } },
    '/notifications/{id}/retry': { post: { tags: ['Notifications'], summary: 'Retry a failed notification', responses: { 200: { description: 'ok' } } } },
    '/templates': { get: { tags: ['Templates'], summary: 'List templates' }, post: { tags: ['Templates'], summary: 'Create template' } },
  },
};
