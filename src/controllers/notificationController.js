const svc = require('../services/notificationService');
module.exports = {
  send: async (req, res, next) => { try { res.status(201).json(await svc.send(req.body)); } catch (e) { next(e); } },
  list: async (req, res, next) => { try { res.json(await svc.list(req.query)); } catch (e) { next(e); } },
  get: async (req, res, next) => { try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); } },
  retry: async (req, res, next) => { try { res.json(await svc.retry(req.params.id)); } catch (e) { next(e); } },
};
