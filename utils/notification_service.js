const NotificationSettings = require('../models/notification_settings');
const { getAdmin } = require('../config/firebase');



const notificationService = {
  /**
   * Send a push notification to a user
   * @param {string} userId - The user ID
   * @param {Object} notification - The notification object
   * @param {string} notification.title - The notification title
   * @param {string} notification.body - The notification body
   * @param {Object} data - Additional data to send with the notification
   * @returns {Promise<Object>} - The result of the notification send operation
   */
  async sendPushNotification(userId, notification, data = {}) {
    try {
      const admin = getAdmin();

      // Get user notification settings
      const settings = await NotificationSettings.findOne({ userId });

      if (!settings || !settings.pushNotificationsEnabled || !settings.deviceTokens.length) {
        console.log(`Push notifications disabled or no device tokens for user ${userId}`);
        return { success: false, message: 'Push notifications disabled or no device tokens' };
      }

      // Prepare the message
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        tokens: settings.deviceTokens.map(device => device.token),
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'findsafe_channel',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Send the message
      const response = await admin.messaging().sendMulticast(message);

      console.log(`Successfully sent message: ${response.successCount} successful, ${response.failureCount} failed`);

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(settings.deviceTokens[idx].token);
          }
        });

        console.log('List of tokens that caused failures:', failedTokens);

        // Remove failed tokens
        if (failedTokens.length > 0) {
          await NotificationSettings.updateOne(
            { userId },
            { $pull: { deviceTokens: { token: { $in: failedTokens } } } }
          );
        }
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send a geofence notification
   * @param {string} userId - The user ID
   * @param {Object} geofence - The geofence object
   * @param {string} deviceName - The device name
   * @param {boolean} isEntry - Whether this is an entry event
   * @returns {Promise<Object>} - The result of the notification send operation
   */
  async sendGeofenceNotification(userId, geofence, deviceName, isEntry) {
    try {
      const admin = getAdmin();

      // Get user notification settings
      const settings = await NotificationSettings.findOne({ userId });

      if (!settings || !settings.geofenceNotificationsEnabled) {
        console.log(`Geofence notifications disabled for user ${userId}`);
        return { success: false, message: 'Geofence notifications disabled' };
      }

      const eventType = isEntry ? 'entered' : 'exited';
      const title = `${deviceName} ${eventType} geofence`;
      const body = `${geofence.name}: ${geofence.description || ''}`;

      return await this.sendPushNotification(
        userId,
        { title, body },
        {
          type: 'geofence',
          geofenceId: geofence._id.toString(),
          deviceId: geofence.deviceId.toString(),
          isEntry: isEntry.toString(),
        }
      );
    } catch (error) {
      console.error('Error sending geofence notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send a device status notification
   * @param {string} userId - The user ID
   * @param {string} deviceId - The device ID
   * @param {string} deviceName - The device name
   * @param {string} status - The device status
   * @param {string} details - Additional details
   * @returns {Promise<Object>} - The result of the notification send operation
   */
  async sendDeviceStatusNotification(userId, deviceId, deviceName, status, details = '') {
    try {
      const admin = getAdmin();

      // Get user notification settings
      const settings = await NotificationSettings.findOne({ userId });

      if (!settings || !settings.deviceStatusNotificationsEnabled) {
        console.log(`Device status notifications disabled for user ${userId}`);
        return { success: false, message: 'Device status notifications disabled' };
      }

      const title = `${deviceName} status changed`;
      const body = `${status}${details ? ': ' + details : ''}`;

      return await this.sendPushNotification(
        userId,
        { title, body },
        {
          type: 'device_status',
          deviceId: deviceId.toString(),
          status,
        }
      );
    } catch (error) {
      console.error('Error sending device status notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send a low battery notification
   * @param {string} userId - The user ID
   * @param {string} deviceId - The device ID
   * @param {string} deviceName - The device name
   * @param {number} batteryLevel - The battery level
   * @returns {Promise<Object>} - The result of the notification send operation
   */
  async sendLowBatteryNotification(userId, deviceId, deviceName, batteryLevel) {
    try {
      const admin = getAdmin();

      // Get user notification settings
      const settings = await NotificationSettings.findOne({ userId });

      if (!settings || !settings.lowBatteryNotificationsEnabled) {
        console.log(`Low battery notifications disabled for user ${userId}`);
        return { success: false, message: 'Low battery notifications disabled' };
      }

      const title = 'Low Battery Alert';
      const body = `${deviceName} battery is at ${batteryLevel}%`;

      return await this.sendPushNotification(
        userId,
        { title, body },
        {
          type: 'low_battery',
          deviceId: deviceId.toString(),
          batteryLevel: batteryLevel.toString(),
        }
      );
    } catch (error) {
      console.error('Error sending low battery notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Register a device token for push notifications
   * @param {string} userId - The user ID
   * @param {string} deviceId - The device ID (client device, not tracked device)
   * @param {string} token - The FCM token
   * @param {string} platform - The device platform (android or ios)
   * @returns {Promise<Object>} - The result of the registration operation
   */
  async registerDeviceToken(userId, deviceId, token, platform) {
    try {
      const admin = getAdmin();

      // Find or create notification settings
      let settings = await NotificationSettings.findOne({ userId });

      if (!settings) {
        settings = new NotificationSettings({
          userId,
          deviceTokens: [],
        });
      }

      // Check if token already exists
      const tokenExists = settings.deviceTokens.some(device =>
        device.token === token && device.deviceId === deviceId
      );

      if (!tokenExists) {
        // Add the new token
        settings.deviceTokens.push({
          deviceId,
          token,
          platform,
          createdAt: new Date(),
        });

        settings.updatedAt = new Date();
        await settings.save();
      }

      return { success: true, message: 'Device token registered successfully' };
    } catch (error) {
      console.error('Error registering device token:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Unregister a device token
   * @param {string} userId - The user ID
   * @param {string} token - The FCM token
   * @returns {Promise<Object>} - The result of the unregistration operation
   */
  async unregisterDeviceToken(userId, token) {
    try {
      const admin = getAdmin();

      // Update notification settings
      const result = await NotificationSettings.updateOne(
        { userId },
        {
          $pull: { deviceTokens: { token } },
          $set: { updatedAt: new Date() }
        }
      );

      if (result.modifiedCount === 0) {
        return { success: false, message: 'Token not found' };
      }

      return { success: true, message: 'Device token unregistered successfully' };
    } catch (error) {
      console.error('Error unregistering device token:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update notification settings
   * @param {string} userId - The user ID
   * @param {Object} settings - The notification settings to update
   * @returns {Promise<Object>} - The result of the update operation
   */
  async updateNotificationSettings(userId, settings) {
    try {
      const admin = getAdmin();

      const updateData = {
        ...settings,
        updatedAt: new Date()
      };

      // Find or create notification settings
      const result = await NotificationSettings.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true }
      );

      return {
        success: true,
        message: 'Notification settings updated successfully',
        settings: result
      };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get notification settings
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - The notification settings
   */
  async getNotificationSettings(userId) {
    try {
      const admin = getAdmin();

      // Find notification settings
      const settings = await NotificationSettings.findOne({ userId });

      if (!settings) {
        // Create default settings
        const defaultSettings = new NotificationSettings({
          userId,
        });

        await defaultSettings.save();
        return { success: true, settings: defaultSettings };
      }

      return { success: true, settings };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = notificationService;
