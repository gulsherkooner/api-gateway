const express = require('express');
require('dotenv').config();
const corsConfig = require('./src/config/cors');
const logger = require('./src/config/logger');
const limiter = require('./src/middleware/rateLimit');
const authRoutes = require('./src/routes/auth');
const compositeRoutes = require('./src/routes/composite');
const postsRoutes = require('./src/routes/posts');
const datingRoutes = require('./src/routes/dating');
const subRoutes = require("./src/routes/sub")
const commentsRoutes = require('./src/routes/comments');

const app = express();
const port = process.env.PORT || 3001;

// Increase payload size limit to handle large video uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
// app.set('trust proxy', true);

// Custom error middleware to ensure JSON responses
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error(`Invalid JSON payload: ${err.message}`);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  if (err.type === 'entity.too.large') {
    logger.error(`Payload too large: ${err.message}`);
    return res.status(413).json({ error: 'Payload too large' });
  }
  logger.error(`Unexpected error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// Apply middleware
app.use(corsConfig);
app.use(limiter);
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'API Gateway'
  });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/auth', compositeRoutes);

//post service routes
app.use('/posts', postsRoutes);

app.use('/comments', commentsRoutes);

//dating services routes
app.use('/date', datingRoutes);

app.use('/followers', subRoutes);

app.listen(port, '0.0.0.0', () => {
  logger.info(`API Gateway running on port ${port}`);
});