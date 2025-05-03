const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  center: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  radius: { type: Number, required: true },
  type: { type: String, enum: ['entry', 'exit', 'dwell', 'both'], default: 'both' },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Devices', required: true },
  isActive: { type: Boolean, default: true },
  color: { type: Number, default: 0xFF4CAF50 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Geofence', geofenceSchema);
