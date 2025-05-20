const express = require('express');
const { authenticateAccessToken } = require('../middleware/auth');
const forwardRequest = require('../utils/forwardRequest');
const logger = require('../config/logger');
const { verifyAccessToken } = require('../utils/jwt');

const router = express.Router();

// ✅ Create dating profile
router.post('/profiles', authenticateAccessToken, express.json(), async (req, res) => {
  logger.info('Handling POST /dating/profiles request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', 'dating-profile');
});

// ✅ Get user's profile by user_id
router.get('/profiles/:user_id', async (req, res) => {
  logger.info(`Handling GET /dating/profiles/${req.params.user_id} request`);
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      req.headers['x-user-id'] = decoded.user_id;
    } catch (error) {
      logger.warn(`Invalid token: ${error.message}`);
    }
  }
  await forwardRequest(req, res, 'dating-service', `dating-profile/${req.params.user_id}`);
});

// ✅ Get profile by Mongo _id
router.get('/profiles/find/:_id', async (req, res) => {
  logger.info(`Handling GET /dating/profiles/find/${req.params._id}`);
  await forwardRequest(req, res, 'dating-service', `find-dating-profile/${req.params._id}`);
});

// ✅ Check if user has a profile
router.get('/check-profile', authenticateAccessToken, async (req, res) => {
  logger.info('Handling GET /dating/check-profile request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', 'check-profile');
});

// ✅ Matchmaking with filters
router.post('/matches', authenticateAccessToken, express.json(), async (req, res) => {
  logger.info('Handling POST /dating/matches request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', 'matches');
});

router.get('/wallet', authenticateAccessToken, async (req, res) => {
  logger.info('Handling GET /dating/wallet request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', 'wallet');
});

// POST add funds to wallet
router.post('/wallet/add', authenticateAccessToken, express.json(), async (req, res) => {
  logger.info('Handling POST /dating/wallet/add request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', 'wallet/add');
});

// POST deduct funds from wallet
router.post('/wallet/deduct', authenticateAccessToken, express.json(), async (req, res) => {
  logger.info('Handling POST /dating/wallet/deduct request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', 'wallet/deduct');
});

module.exports = router;
