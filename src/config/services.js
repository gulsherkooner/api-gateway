module.exports = {
  'auth-service': process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  'post-service': process.env.POST_SERVICE_URL || 'http://localhost:3004',
};