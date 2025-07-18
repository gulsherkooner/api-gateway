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
  await forwardRequest(req, res, 'dating-service', 'api/dating-profile');
});

router.get('/profiles', authenticateAccessToken, async (req, res) => {
  logger.info('Handling GET ALL /dating/profiles request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', 'api/dating-profiles');
});

// ✅ Get user's profile by user_id
router.get('/dating-profile/:user_id', async (req, res) => {
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
  await forwardRequest(req, res, 'dating-service', `api/dating-profile/${req.params.user_id}`);
});

// ✅ Get profile by Mongo _id
router.get('/find-dating-profile/:_id', async (req, res) => {
  logger.info(`Handling GET /dating/profiles/find/${req.params._id}`);
  await forwardRequest(req, res, 'dating-service', `api/find-dating-profile/${req.params._id}`);
});

// ✅ Check if user has a profile
router.get('/check-profile', authenticateAccessToken, async (req, res) => {
  // console.log("Recived!!");
  logger.info('Handling GET /dating/check-profile request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', 'api/check-profile');
});

// ✅ Matchmaking with filters
router.post('/matches', authenticateAccessToken, express.json(), async (req, res) => {
  logger.info('Handling POST /dating/matches request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', 'api/matches');
});

// POST add funds to wallet
router.post('/wallet/topup', authenticateAccessToken, express.json(), async (req, res) => {
  logger.info('Handling POST /dating/wallet/add request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', 'api/wallet/topup');
});

// ✅ Deduct funds from authenticated user's wallet
router.post('/wallet/deduct', authenticateAccessToken, express.json(), async (req, res) => {
  const userId = req.user?.user_id;
  logger.info('Handling POST /wallet/deduct request', { user_id: userId });

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: user_id missing from token.' });
  }

  req.headers['x-user-id'] = userId; // Inject for downstream service
  await forwardRequest(req, res, 'dating-service', 'api/wallet/deduct');
});
router.post('/wallet/withdraw', authenticateAccessToken, express.json(), async (req, res) => {
  const userId = req.user?.user_id;
  logger.info('Handling POST /wallet/withdraw request', { user_id: userId });

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: user_id missing from token.' });
  }

  req.headers['x-user-id'] = userId; // Inject for downstream service
  await forwardRequest(req, res, 'dating-service', 'api/wallet/withdraw');
});


router.get('/wallet/:userId', async (req, res) => {
  logger.info(`Handling GET /dating/wallet/${req.params.userId} request`);
  await forwardRequest(req, res, 'dating-service', `api/wallet/${req.params.userId}`);
});

// ✅ Update dating profile by user_id
router.put('/dating-profile/:user_id', authenticateAccessToken, express.json(), async (req, res) => {
  logger.info(`Handling PUT /dating-profile/${req.params.user_id} request`, { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'dating-service', `api/dating-profile/${req.params.user_id}`, 'PUT');
});

router.post(
  '/dating-posts',
  authenticateAccessToken,
  express.json({ limit: '10mb' }), // increase limit for image upload
  async (req, res) => {
    logger.info('Handling POST /dating-posts request', { user_id: req.user?.user_id });

    // Attach user_id from JWT to headers for downstream service
    req.headers['x-user-id'] = req.user?.user_id || '';

    // Forward request to dating-service's /api/dating-posts endpoint
    await forwardRequest(req, res, 'dating-service', 'api/dating-posts', 'POST');
  }
);
router.get(
  '/dating-posts/me',
  authenticateAccessToken,
  async (req, res) => {
    logger.info('Handling POST /dating-posts request', { user_id: req.user?.user_id });

    // Attach user_id from JWT to headers for downstream service
    req.headers['x-user-id'] = req.user?.user_id || '';
    // Forward request to dating-service's /api/dating-posts endpoint
    await forwardRequest(req, res, 'dating-service', 'api/dating-posts/me', 'GET');
  }
);

router.post('/settings/:user_id', authenticateAccessToken, express.json(), async (req, res) => {
  const userId = req.user?.user_id;
  logger.info('Handling POST /settings/:user_id request', { user_id: userId });

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: user_id missing from token.' });
  }

  req.headers['x-user-id'] = userId; // Inject for downstream service
  await forwardRequest(req, res, 'dating-service', `api/settings/${req.params.user_id}`);
});

router.get(
  '/settings/:user_id',
  authenticateAccessToken,
  async (req, res) => {
    logger.info('Handling POST /settings/:user_id request', { user_id: req.user?.user_id });

    // Attach user_id from JWT to headers for downstream service
    req.headers['x-user-id'] = req.user?.user_id || '';
    // Forward request to dating-service's /api/dating-posts endpoint
    await forwardRequest(req, res, 'dating-service', `api/settings/${req.params.user_id}`, 'GET');
  }
);

router.patch(
  '/dating-posts/pin-post/:id',
  authenticateAccessToken,
  async (req, res) => {
    logger.info('Handling PATCH /dating-posts/pin-post/:id request', {
      user_id: req.user?.user_id,
      post_id: req.params.id,
    });

    req.headers['x-user-id'] = req.user?.user_id || '';
    await forwardRequest(
      req,
      res,
      'dating-service',
      `api/dating-posts/pin-post/${req.params.id}`,
      'PATCH'
    );
  }
);

router.get('/unlocked-contacts', authenticateAccessToken, async (req, res) => {
  const userId = req.user?.user_id;
  logger.info('Handling GET /dating/unlocked-contacts request', { user_id: userId });

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: user_id missing from token.' });
  }

  req.headers['x-user-id'] = userId;
  await forwardRequest(req, res, 'dating-service', `api/unlocked-contacts/${userId}`, 'GET');
});


module.exports = router;
