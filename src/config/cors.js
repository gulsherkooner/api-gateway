const cors = require('cors');

const corsOptions = {
  origin: ['https://next-frontend-one-xi.vercel.app', 'http://localhost:3000'],
  credentials: true, // Allow cookies (e.g., refreshToken)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['X-Requested-With, Content-Type, Authorization'],
};

module.exports = cors(corsOptions);