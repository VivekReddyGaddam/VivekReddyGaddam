const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for AI generation endpoints
const aiLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 5,
  message: 'Too many generation requests. Please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false
});

// Auth endpoints limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter, aiLimiter, authLimiter };
