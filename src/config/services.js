module.exports = {
  'auth-service': process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  'post-service': process.env.POST_SERVICE_URL || 'http://localhost:3004',
  'dating-service': process.env.DATING_SERVICE_URL || 'http://localhost:5000', // add this line
  'message-service': process.env.MESSAGE_SERVICE_URL || 'http://localhost:3007', // add this line
  'sub-service': process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3005',
};
