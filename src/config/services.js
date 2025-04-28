const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  profile: process.env.PROFILE_SERVICE_URL || 'http://localhost:3003',
};

module.exports = services;