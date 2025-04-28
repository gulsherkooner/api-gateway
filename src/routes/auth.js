const express = require('express');
const axios = require('axios');
const { validateRegister, validateLogin, validateRefresh } = require('../middleware/validate');
const validateResult = require('../middleware/validateResult');
const limiter = require('../middleware/rateLimit');
const logger = require('../config/logger');
const redis = require('../config/redis');

const router = express.Router();

const forwardRequest = async (req, res, serviceUrl, retries = 2) => {
  const targetUrl = `${serviceUrl}${req.originalUrl.replace(/^\/auth/, '')}`;
  logger.info(`Forwarding ${req.method} request to ${targetUrl}`);
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: { ...req.headers, host: undefined, connection: undefined },
      data: req.body,
      timeout: 5000,
    });
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 304) {
      Object.entries(error.response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      res.status(304).send();
      return;
    }
    if (retries > 0 && error.code === 'ECONNREFUSED') {
      logger.warn(`Retrying request to ${targetUrl}, retries left: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return forwardRequest(req, res, serviceUrl, retries - 1);
    }
    logger.error(`Error forwarding request to ${targetUrl}: ${error.message}`);
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Service unavailable' });
  }
};

router.post('/register', limiter, validateRegister, validateResult, async (req, res) => {
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
  await forwardRequest(req, res, authServiceUrl);
});

router.post('/login', limiter, validateLogin, validateResult, async (req, res) => {
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
  await forwardRequest(req, res, authServiceUrl);
});

router.post('/refresh', validateRefresh, validateResult, async (req, res) => {
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
  await forwardRequest(req, res, authServiceUrl);
});

router.get('/user', async (req, res) => {
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
  await forwardRequest(req, res, authServiceUrl);
});

// router.get('/composite-user', async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const cacheKey = `composite-user:${authHeader.split(' ')[1]}`;
//     const cachedData = await redis.get(cacheKey);

//     if (cachedData) {
//       return res.status(200).json(JSON.parse(cachedData));
//     }

//     const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
//     const profileServiceUrl = process.env.PROFILE_SERVICE_URL || 'http://localhost:3003';

//     const [authResponse, profileResponse] = await Promise.all([
//       axios.get(`${authServiceUrl}/user`, {
//         headers: { Authorization: authHeader },
//         timeout: 5000,
//       }).catch((err) => {
//         logger.error(`Error fetching user data: ${err.message}`);
//         throw err;
//       }),
//       axios.get(`${profileServiceUrl}/profile`, {
//         headers: { Authorization: authHeader },
//         timeout: 5000,
//       }).catch((err) => {
//         logger.warn(`Profile service unavailable: ${err.message}`);
//         return { data: {} };
//       }),
//     ]);

//     const responseData = {
//       user: authResponse.data.user,
//       profile: profileResponse.data,
//     };

//     await redis.setex(cacheKey, 3600, JSON.stringify(responseData));
//     res.status(200).json(responseData);
//   } catch (error) {
//     logger.error(`Composite user error: ${error.message}`);
//     res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Internal server error' });
//   }
// });

module.exports = router;