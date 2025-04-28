const axios = require('axios');
const logger = require('../config/logger');
const services = require('../config/services');

const forwardRequest = async (req, res, service, path) => {
  try {
    const serviceUrl = services[service];
    if (!serviceUrl) {
      throw new Error(`Service ${service} not found`);
    }
    logger.info(`Forwarding ${req.method} request to: ${serviceUrl}/${path}`, { ip: req.ip });
    const response = await axios({
      method: req.method,
      url: `${serviceUrl}/${path}`,
      headers: { ...req.headers, host: undefined, connection: undefined },
      data: req.body,
      validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
    });
    if (response.status === 304) {
      logger.info(`Received 304 Not Modified for ${path}`, { service });
    }
    res.status(response.status).json(response.data || {});
  } catch (error) {
    logger.error(`API Gateway error: ${error.message}`, {
      service,
      path,
      status: error.response?.status,
      ip: req.ip,
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal server error',
    });
  }
};

module.exports = forwardRequest;