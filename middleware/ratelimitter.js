// rateLimitMiddleware.js
const rateLimit = require('express-rate-limit');
const RateLimitModel = require('../models/utils_models/RateLimitModel');

function createRateLimitMiddleware(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
    statusCode = 429 // Too Many Requests
  } = options;

  return rateLimit({
    windowMs,
    max,
    message,
    statusCode,
    handler: async (req, res, next, options) => {
      const ip = req.ip;
      const now = Date.now();

      try {
        // Check if IP is already banned
        const bannedIP = await RateLimitModel.findOne({ ip, banned: true });
        if (bannedIP) {
          return res.status(403).send('Your IP has been banned due to excessive requests.');
        }

        // Update request count for IP
        const result = await RateLimitModel.findOneAndUpdate(
          { ip },
          { 
            $inc: { count: 1 },
            $setOnInsert: { firstRequest: now },
            $set: { lastRequest: now }
          },
          { upsert: true, new: true }
        );

        // Check if requests exceed limit
        if (result.count > max) {
          // Ban the IP
          await RateLimitModel.updateOne({ ip }, { $set: { banned: true, bannedAt: now } });
          return res.status(403).send('Your IP has been banned due to excessive requests.');
        }

        // If not banned and not exceeding limit, proceed to next middleware
        next();
      } catch (error) {
        console.error('Error in rate limit middleware:', error);
        next(error);
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = createRateLimitMiddleware;