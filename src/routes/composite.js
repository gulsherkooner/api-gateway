const express = require('express');
const axios = require('axios');
const logger = require('../config/logger');
const services = require('../config/services');

const router = express.Router();

router.get('/composite-user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Unauthorized composite-user request', { ip: req.ip });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // Fetch user data from Authentication Microservice
    const authResponse = await axios.get(`${services.auth}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
    });

    if (authResponse.status !== 200) {
      logger.warn('Failed to fetch user data', { status: authResponse.status, ip: req.ip });
      return res.status(authResponse.status).json(authResponse.data);
    }

    const userData = authResponse.data.user;

    // Fetch profile data from Profile Microservice (hypothetical)
    let profileData = {};
    try {
      const profileResponse = await axios.get(`${services.profile}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (status) => (status >= 200 && status < 300) || status === 404,
      });
      if (profileResponse.status === 200) {
        profileData = profileResponse.data.profile;
      }
    } catch (error) {
      logger.warn('Profile service unavailable, proceeding with user data only', {
        error: error.message,
        ip: req.ip,
      });
    }

    // Combine responses
    const compositeData = {
      user: userData,
      profile: profileData,
    };

    logger.info('Successfully composed user and profile data', { ip: req.ip });
    res.status(200).json(compositeData);
  } catch (error) {
    logger.error(`Composite-user error: ${error.message}`, {
      status: error.response?.status,
      ip: req.ip,
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal server error',
    });
  }
});

module.exports = router;