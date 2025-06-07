const express = require('express');
const { authenticateAccessToken } = require('../middleware/auth');
const forwardRequest = require('../utils/forwardRequest');
const logger = require('../config/logger');
const { verifyAccessToken } = require('../utils/jwt');

const router = express.Router();

// Create comment or reply
router.post('/', authenticateAccessToken, express.json({ limit: '10mb' }), async (req, res) => {
  logger.info('Handling POST /comments request', { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'post-service', 'comments');
});

// Delete comment
router.delete('/:comment_id', authenticateAccessToken, async (req, res) => {
  logger.info(`Handling DELETE /comments/${req.params.comment_id} request`, { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'post-service', `comments/${req.params.comment_id}`);
});

// Like a comment
router.post('/:comment_id/like', authenticateAccessToken, async (req, res) => {
  logger.info(`Handling POST /comments/${req.params.comment_id}/like request`, { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'post-service', `comments/${req.params.comment_id}/like`);
});

// Unlike a comment
router.delete('/:comment_id/like', authenticateAccessToken, async (req, res) => {
  logger.info(`Handling DELETE /comments/${req.params.comment_id}/like request`, { user_id: req.user?.user_id });
  req.headers['x-user-id'] = req.user?.user_id || '';
  await forwardRequest(req, res, 'post-service', `comments/${req.params.comment_id}/like`);
});

// Get all comments for a post (including replies)
router.get('/post/:post_id', async (req, res) => {
  logger.info(`Handling GET /comments/post/${req.params.post_id} request`);
  await forwardRequest(req, res, 'post-service', `comments/post/${req.params.post_id}`);
});

// Get all likes for all comments in a post (not user-specific)
router.get('/post/:post_id/likes', async (req, res) => {
  logger.info(`Handling GET /comments/post/${req.params.post_id}/likes request`);
  await forwardRequest(req, res, 'post-service', `comments/post/${req.params.post_id}/likes`);
});

// Get all users who liked a specific comment
router.get('/:comment_id/likes', async (req, res) => {
  logger.info(`Handling GET /comments/${req.params.comment_id}/likes request`);
  await forwardRequest(req, res, 'post-service', `comments/${req.params.comment_id}/likes`);
});

module.exports = router;