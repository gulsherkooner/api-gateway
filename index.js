const express = require('express');
require('dotenv').config();
const corsConfig = require('./src/config/cors');
const logger = require('./src/config/logger');
const limiter = require('./src/middleware/rateLimit');
const authRoutes = require('./src/routes/auth');
const compositeRoutes = require('./src/routes/composite');

const app = express();
const port = process.env.PORT || 3001;

// Apply middleware
app.use(corsConfig);
app.use(limiter);
app.use(express.json());

// Mount routes
app.use('/auth', authRoutes);
app.use('/auth', compositeRoutes);

app.listen(port, () => {
  logger.info(`API Gateway running on port ${port}`); 
});