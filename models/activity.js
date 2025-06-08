const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Devices',
        required: false // Some activities might not be device-specific
    },
    type: {
        type: String,
        required: true,
        enum: [
            'device_connected',
            'device_disconnected', 
            'location_update',
            'device_mode_changed',
            'command_sent',
            'command_executed',
            'geofence_entered',
            'geofence_exited',
            'user_login',
            'user_logout',
            'device_added',
            'device_removed',
            'profile_updated',
            'security_alert'
        ]
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['success', 'warning', 'error', 'info'],
        default: 'info'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // For storing additional activity-specific data
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ deviceId: 1, timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
