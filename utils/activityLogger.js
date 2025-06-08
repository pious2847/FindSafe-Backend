const Activity = require('../models/activity');

class ActivityLogger {
    static async logActivity(userId, type, title, description, status = 'info', deviceId = null, metadata = {}) {
        try {
            const activity = new Activity({
                userId,
                deviceId,
                type,
                title,
                description,
                status,
                metadata,
                timestamp: new Date()
            });

            await activity.save();
            console.log(`Activity logged: ${type} for user ${userId}`);
            return activity;
        } catch (error) {
            console.error('Error logging activity:', error);
            return null;
        }
    }

    // Device-related activities
    static async logDeviceConnected(userId, deviceId, deviceName) {
        return this.logActivity(
            userId,
            'device_connected',
            'Device Connected',
            `${deviceName} connected successfully`,
            'success',
            deviceId,
            { deviceName }
        );
    }

    static async logDeviceDisconnected(userId, deviceId, deviceName) {
        return this.logActivity(
            userId,
            'device_disconnected',
            'Device Disconnected',
            `${deviceName} disconnected`,
            'warning',
            deviceId,
            { deviceName }
        );
    }

    static async logLocationUpdate(userId, deviceId, deviceName, location) {
        return this.logActivity(
            userId,
            'location_update',
            'Location Updated',
            `${deviceName} location updated`,
            'info',
            deviceId,
            { 
                deviceName,
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address || 'Unknown location'
            }
        );
    }

    static async logDeviceModeChanged(userId, deviceId, deviceName, oldMode, newMode) {
        return this.logActivity(
            userId,
            'device_mode_changed',
            'Device Mode Changed',
            `${deviceName} mode changed from ${oldMode} to ${newMode}`,
            newMode === 'disabled' ? 'warning' : 'success',
            deviceId,
            { deviceName, oldMode, newMode }
        );
    }

    static async logCommandSent(userId, deviceId, deviceName, command) {
        return this.logActivity(
            userId,
            'command_sent',
            'Command Sent',
            `${command} command sent to ${deviceName}`,
            'info',
            deviceId,
            { deviceName, command }
        );
    }

    static async logCommandExecuted(userId, deviceId, deviceName, command) {
        return this.logActivity(
            userId,
            'command_executed',
            'Command Executed',
            `${command} command executed on ${deviceName}`,
            'success',
            deviceId,
            { deviceName, command }
        );
    }

    static async logGeofenceEvent(userId, deviceId, deviceName, geofenceName, eventType) {
        const isEntered = eventType === 'entered';
        return this.logActivity(
            userId,
            isEntered ? 'geofence_entered' : 'geofence_exited',
            `Geofence ${isEntered ? 'Entered' : 'Exited'}`,
            `${deviceName} ${eventType} geofence: ${geofenceName}`,
            isEntered ? 'info' : 'warning',
            deviceId,
            { deviceName, geofenceName, eventType }
        );
    }

    // User-related activities
    static async logUserLogin(userId, userEmail, ipAddress) {
        return this.logActivity(
            userId,
            'user_login',
            'User Login',
            `User logged in from ${ipAddress}`,
            'success',
            null,
            { userEmail, ipAddress }
        );
    }

    static async logUserLogout(userId, userEmail) {
        return this.logActivity(
            userId,
            'user_logout',
            'User Logout',
            `User logged out`,
            'info',
            null,
            { userEmail }
        );
    }

    static async logDeviceAdded(userId, deviceId, deviceName) {
        return this.logActivity(
            userId,
            'device_added',
            'Device Added',
            `New device "${deviceName}" added to account`,
            'success',
            deviceId,
            { deviceName }
        );
    }

    static async logDeviceRemoved(userId, deviceId, deviceName) {
        return this.logActivity(
            userId,
            'device_removed',
            'Device Removed',
            `Device "${deviceName}" removed from account`,
            'warning',
            deviceId,
            { deviceName }
        );
    }

    static async logProfileUpdated(userId, userEmail, changes) {
        return this.logActivity(
            userId,
            'profile_updated',
            'Profile Updated',
            `User profile updated`,
            'success',
            null,
            { userEmail, changes }
        );
    }

    static async logSecurityAlert(userId, deviceId, deviceName, alertType, details) {
        return this.logActivity(
            userId,
            'security_alert',
            'Security Alert',
            `Security alert: ${alertType} for ${deviceName}`,
            'error',
            deviceId,
            { deviceName, alertType, details }
        );
    }

    // Get recent activities for a user
    static async getRecentActivities(userId, limit = 10, type = null) {
        try {
            const query = { userId };
            if (type) {
                query.type = type;
            }

            const activities = await Activity.find(query)
                .populate('deviceId', 'devicename modelNumber')
                .sort({ timestamp: -1 })
                .limit(limit)
                .lean();

            return activities.map(activity => ({
                id: activity._id,
                type: activity.type,
                title: activity.title,
                description: activity.description,
                status: activity.status,
                timestamp: activity.timestamp,
                device: activity.deviceId?.devicename || 'System',
                metadata: activity.metadata
            }));
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            return [];
        }
    }
}

module.exports = ActivityLogger;
