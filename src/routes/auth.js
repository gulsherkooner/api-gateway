const express = require('express');
const { validateRegister, validateLogin, validateRefresh } = require('../middleware/validate');
const validateResult = require('../middleware/validateResult');
const limiter = require('../middleware/rateLimit');
const { authenticateAccessToken, authenticateRefreshToken } = require('../middleware/auth');
const { generateAccessToken, generateRefreshToken, verifyAccessToken } = require('../utils/jwt');
const logger = require('../config/logger');
const forwardRequest = require('../utils/forwardRequest');

const router = express.Router();

router.post('/register', limiter, validateRegister, validateResult, async (req, res) => {
  logger.info('Handling POST /auth/register request');
  await forwardRequest(req, res, 'auth-service', 'register');
});

router.post('/login', limiter, validateLogin, validateResult, async (req, res) => {
  logger.info('Handling POST /auth/login request');
  await forwardRequest(req, res, 'auth-service', 'login');
});

router.post('/refresh', validateRefresh, validateResult, authenticateRefreshToken, async (req, res) => {
  try {
    const { user_id, email, username } = req.user;
    const newAccessToken = generateAccessToken({ user_id, email, username });
    const newRefreshToken = generateRefreshToken({ user_id, email, username });

    res.set('Set-Cookie', `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`);
    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user', authenticateAccessToken, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      req.headers['x-user-id'] = decoded.user_id;
      logger.info(`GET /posts/${req.params.post_id} with user_id: ${decoded.user_id}`);
    } catch (error) {
      logger.warn(`Invalid token for GET /posts/${req.params.post_id}: ${error.message}`);
    }
  }
  logger.info('Handling GET /auth/user request');
  await forwardRequest(req, res, 'auth-service', 'user');
});

router.get('/user/:user_id', async (req, res) => {
  logger.info('Handling GET /auth/users request');
  await forwardRequest(req, res, 'auth-service', `user/${req.params.user_id}`);
});

module.exports = router;