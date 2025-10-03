const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('🔴 Redis Connected');
    });

    await redisClient.connect();
    
    // Set default TTL for cache
    await redisClient.configSet('default-ttl', '3600'); // 1 hour
    
  } catch (error) {
    console.error('Redis connection error:', error);
    // Continue without Redis in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Continuing without Redis cache');
    } else {
      process.exit(1);
    }
  }
};

const getRedisClient = () => redisClient;

const cacheStory = async (storyId, storyData, ttl = 3600) => {
  if (!redisClient) return;
  try {
    await redisClient.setEx(`story:${storyId}`, ttl, JSON.stringify(storyData));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

const getCachedStory = async (storyId) => {
  if (!redisClient) return null;
  try {
    const cached = await redisClient.get(`story:${storyId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

const invalidateStoryCache = async (storyId) => {
  if (!redisClient) return;
  try {
    await redisClient.del(`story:${storyId}`);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

module.exports = { 
  connectRedis, 
  getRedisClient, 
  cacheStory, 
  getCachedStory, 
  invalidateStoryCache 
};