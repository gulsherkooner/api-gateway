const cors = require('cors');

const corsOptions = {
  origin: ['http://next-frontend:3000', 'http://post-service:3004'],
  credentials: true, // Allow cookies (e.g., refreshToken)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['X-Requested-With, Content-Type, Authorization'],
};

module.exports = cors(corsOptions);