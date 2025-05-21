const express = require('express');
const forwardRequest = require('../utils/forwardRequest');
const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../config/logger');

const router = express.Router();

router.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      req.headers['x-user-id'] = decoded.user_id;
      logger.info(`Request from user_id: ${decoded.user_id}`);
      next();
    } catch (error) {
      logger.warn(`Invalid token: ${error.message}`);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
});

router.post('/', async (req, res) => {
  await forwardRequest(req, res, 'sub-service', 'followers');
});
router.delete('/:target_userid', async (req, res) => {
  await forwardRequest(req, res, 'sub-service', `followers/${req.params.target_userid}`);
});
router.get('/check/:target_userid', async (req, res) => {
  await forwardRequest(req, res, 'sub-service', `followers/check/${req.params.target_userid}`);
});
router.get('/:user_id', async (req, res) => {
  await forwardRequest(req, res, 'sub-service', `followers/${req.params.user_id}`);
});
router.get('/following/:user_id', async (req, res) => {
  await forwardRequest(req, res, 'sub-service', `followers/following/${req.params.user_id}`);
});

module.exports = router;