const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pushNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  emailNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  geofenceNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  deviceStatusNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  lowBatteryNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  securityNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  deviceTokens: [{
    deviceId: String,
    token: String,
    platform: {
      type: String,
      enum: ['android', 'ios'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);
