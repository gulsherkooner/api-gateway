const Redis = require('ioredis');

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined in .env file');
}

console.log('API Gateway - Connecting to Redis with URL:', process.env.REDIS_URL);

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
  console.log('API Gateway - Connected to Redis');
});

redis.on('error', (err) => {
  console.error('API Gateway - Redis connection error:', err.message);
});

module.exports = redis;