const notificationService = require('../utils/notification_service');
const User = require('../models/users');
const DevicesInfo = require('../models/deviceinfo');

const notificationController = {
  /**
   * Register a device token for push notifications
   */
  async registerDeviceToken(req, res) {
    try {
      const { userId, deviceId, token, platform } = req.body;
      
      // Validate input
      if (!userId || !deviceId || !token || !platform) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required parameters' 
        });
      }
      
      // Validate platform
      if (platform !== 'android' && platform !== 'ios') {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid platform. Must be "android" or "ios"' 
        });
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Register the token
      const result = await notificationService.registerDeviceToken(
        userId, deviceId, token, platform
      );
      
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error registering device token:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while registering device token',
        error: error.message
      });
    }
  },
  
  /**
   * Unregister a device token
   */
  async unregisterDeviceToken(req, res) {
    try {
      const { userId, token } = req.body;
      
      // Validate input
      if (!userId || !token) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required parameters' 
        });
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Unregister the token
      const result = await notificationService.unregisterDeviceToken(userId, token);
      
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error unregistering device token:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while unregistering device token',
        error: error.message
      });
    }
  },
  
  /**
   * Update notification settings
   */
  async updateNotificationSettings(req, res) {
    try {
      const { userId } = req.params;
      const settings = req.body;
      
      // Validate input
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing user ID' 
        });
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Update settings
      const result = await notificationService.updateNotificationSettings(userId, settings);
      
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while updating notification settings',
        error: error.message
      });
    }
  },
  
  /**
   * Get notification settings
   */
  async getNotificationSettings(req, res) {
    try {
      const { userId } = req.params;
      
      // Validate input
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing user ID' 
        });
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Get settings
      const result = await notificationService.getNotificationSettings(userId);
      
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error getting notification settings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while getting notification settings',
        error: error.message
      });
    }
  },
  
  /**
   * Send a test notification
   */
  async sendTestNotification(req, res) {
    try {
      const { userId } = req.params;
      
      // Validate input
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing user ID' 
        });
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Send test notification
      const result = await notificationService.sendPushNotification(
        userId,
        {
          title: 'Test Notification',
          body: 'This is a test notification from FindSafe'
        },
        {
          type: 'test'
        }
      );
      
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while sending test notification',
        error: error.message
      });
    }
  }
};

module.exports = notificationController;
