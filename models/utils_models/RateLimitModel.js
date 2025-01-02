const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  firstRequest: { type: Date, default: Date.now },
  lastRequest: { type: Date, default: Date.now },
  banned: { type: Boolean, default: false },
  bannedAt: { type: Date }
}, { timestamps: true });

const RateLimit = mongoose.model('RateLimit', rateLimitSchema);
module.exports = RateLimit;