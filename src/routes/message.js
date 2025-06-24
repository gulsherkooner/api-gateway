const express = require('express');
const { authenticateAccessToken } = require('../middleware/auth');
const forwardRequest = require('../utils/forwardRequest');
const logger = require('../config/logger');
const { verifyAccessToken } = require('../utils/jwt');

const router = express.Router();

router.post('/upload-media', authenticateAccessToken, async (req, res) => {
  logger.info('Handling POST /messages/upload-media request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'message-service', 'upload-media');
});

router.get('/conversation/:partnerId/:userId', authenticateAccessToken, async (req, res) => {
  logger.info('Handling GET /conversation/:partnerId/:userId request', { user_id: req.params.userId });
  req.headers['x-user-id'] = req.params.userId || '';
  await forwardRequest(req, res, 'message-service', `conversation/${req.params.partnerId}/${req.params.userId}`);
});
router.get('/last-messages/:userId', authenticateAccessToken, async (req, res) => {
  logger.info('Handling GET /last-messages/:userId request', { user_id: req.params.userId });
  req.headers['x-user-id'] = req.params.userId || '';
  await forwardRequest(req, res, 'message-service', `last-messages/${req.params.userId}`);
});

router.get('/unread-counts/:userId', authenticateAccessToken, async (req, res) => {
  logger.info('Handling GET /unread-counts/:userId request', { user_id: req.params.userId });
  req.headers['x-user-id'] = req.params.userId || '';
  await forwardRequest(req, res, 'message-service', `unread-counts/${req.params.userId}`);
});

router.put('/mark-read/:fromId/:userId', authenticateAccessToken, async (req, res) => {
  logger.info(`Handling PUT /mark-read/:fromId/:userId request`, { user_id: req.params.userId });
  req.headers['x-user-id'] = req.params.userId || '';
  await forwardRequest(req, res, 'message-service', `mark-read/${req.params.fromId}/${req.params.userId}`);
});

module.exports = router;
