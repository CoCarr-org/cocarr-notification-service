const express = require('express');
const { check } = require('express-validator');
const { assertValid } = require('../utils/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/notificationController');

const router = express.Router();
const validate = (req, res, next) => { try { assertValid(req); next(); } catch (e) { next(e); } };

router.post('/send', [authenticate, check('to').notEmpty().withMessage('to is required'), validate], ctrl.send);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/:id/retry', authenticate, ctrl.retry);
module.exports = router;
