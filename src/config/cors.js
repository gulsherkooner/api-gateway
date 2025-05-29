const cors = require('cors');

const corsOptions = {
  origin: ['https://next-frontend-one-xi.vercel.app', 'http://135.181.192.55:3000', 'https://post-microservice.vercel.app','http://135.181.192.55:3004'],
  credentials: true, // Allow cookies (e.g., refreshToken)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['X-Requested-With, Content-Type, Authorization'],
};

module.exports = cors(corsOptions);