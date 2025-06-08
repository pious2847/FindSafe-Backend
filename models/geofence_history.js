const mongoose = require('mongoose');

const geofenceHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Devices',
    required: true
  },
  geofenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Geofence',
    required: true
  },
  eventType: {
    type: String,
    enum: ['entered', 'exited', 'dwell_start', 'dwell_end'],
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  distance: {
    type: Number, // Distance from geofence center in meters
    required: true
  },
  dwellTime: {
    type: Number, // Time spent inside geofence in milliseconds
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
geofenceHistorySchema.index({ userId: 1, timestamp: -1 });
geofenceHistorySchema.index({ deviceId: 1, timestamp: -1 });
geofenceHistorySchema.index({ geofenceId: 1, timestamp: -1 });
geofenceHistorySchema.index({ eventType: 1, timestamp: -1 });

const GeofenceHistory = mongoose.model('GeofenceHistory', geofenceHistorySchema);

module.exports = GeofenceHistory;
