const express = require('express');
const { authenticateAccessToken } = require('../middleware/auth');
const forwardRequest = require('../utils/forwardRequest');
const logger = require('../config/logger');
const { verifyAccessToken } = require('../utils/jwt');

const router = express.Router();

router.post('/', authenticateAccessToken,express.json({ limit: '100mb' }), async (req, res) => {
  logger.info('Handling POST /posts request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'post-service', 'posts');
});

// Public route: Get reels with pagination, seed, and optional id prioritization
router.get('/reels', async (req, res) => {
  logger.info('Handling GET /posts/reels request');
  // Forward pagination, seed, and id query params if present
  const { page, limit, seed, id } = req.query;
  let path = 'posts/reels';
  const params = [];
  if (page) params.push(`page=${page}`);
  if (limit) params.push(`limit=${limit}`);
  if (seed) params.push(`seed=${seed}`);
  if (id) params.push(`id=${id}`);
  if (params.length > 0) path += `?${params.join('&')}`;
  await forwardRequest(req, res, 'post-service', path);
});

router.put('/:post_id', authenticateAccessToken, async (req, res) => {
  logger.info(`Handling PUT /posts/${req.params.post_id} request`, { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'post-service', `posts/${req.params.post_id}`);
});

router.delete('/:post_id', authenticateAccessToken, async (req, res) => {
  logger.info(`Handling DELETE /posts/${req.params.post_id} request`, { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'post-service', `posts/${req.params.post_id}`);   
});

router.get('/:post_id', async (req, res) => {
  logger.info(`Handling GET /posts/${req.params.post_id} request`);
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
  await forwardRequest(req, res, 'post-service', `posts/${req.params.post_id}`);
});

router.get('/user/:user_id', async (req, res) => {
  logger.info(`Handling GET /posts/user/${req.params.user_id} request`);
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      req.headers['x-user-id'] = decoded.user_id;
      logger.info(`GET /posts/user/${req.params.user_id} with user_id: ${decoded.user_id}`);
    } catch (error) {
      logger.warn(`Invalid token for GET /posts/user/${req.params.user_id}: ${error.message}`);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  await forwardRequest(req, res, 'post-service', `posts/user/${req.params.user_id}`);
});

router.get('/', async (req, res) => {
  logger.info('Handling GET /posts request');
  // Forward pagination and seed query params if present
  const { page, limit, seed } = req.query;
  let path = 'posts';
  const params = [];
  if (page) params.push(`page=${page}`);
  if (limit) params.push(`limit=${limit}`);
  if (seed) params.push(`seed=${seed}`);
  if (params.length > 0) path += `?${params.join('&')}`;
  await forwardRequest(req, res, 'post-service', path);
});

router.get('/user/public/:user_id', async (req, res) => {
  logger.info('Handling GET /posts request');
  await forwardRequest(req, res, 'post-service', `posts/user/public/${req.params.user_id}`);
});

module.exports = router;