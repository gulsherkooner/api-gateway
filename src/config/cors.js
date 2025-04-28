const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',
  'https://my-app-sable-two-23.vercel.app', // Replace with your Vercel URL
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