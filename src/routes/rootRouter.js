const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('../docs/openapi');
const { health } = require('../controllers/healthController');

const { authenticate } = require('../middlewares/authMiddleware');
const { check } = require('express-validator');
const { assertValid } = require('../utils/validate');
const notificationController = require('../controllers/notificationController');

const router = express.Router();
const validate = (req, res, next) => { try { assertValid(req); next(); } catch (e) { next(e); } };

router.get('/health', health);
router.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
router.use('/templates', require('./templateRouter'));
router.use('/notifications', require('./notificationRouter'));
// Root-level send so the gateway path /v1/notify/send maps cleanly to /v1/send.
router.post('/send', [authenticate, check('to').notEmpty().withMessage('to is required'), validate], notificationController.send);
module.exports = router;
