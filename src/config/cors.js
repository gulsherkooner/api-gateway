const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',
  'https://next-frontend-one-xi.vercel.app', // Replace with your Vercel URL
];

module.exports = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
});