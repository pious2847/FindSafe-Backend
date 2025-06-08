const Geofence = require('../models/geofence');
const GeofenceHistory = require('../models/geofence_history');
const DevicesInfo = require('../models/deviceinfo');
const User = require('../models/users');
const { sendCommandToDevice } = require('../utils/websocket');
const notificationService = require('../utils/notification_service');
const ActivityLogger = require('../utils/activityLogger');

const geofenceController = {
  // Get all geofences
  async getGeofences(req, res) {
    try {
      const token = req.headers.authorization;
      if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // In a real implementation, you would verify the JWT token here
      // For now, we'll just get all geofences
      const geofences = await Geofence.find();

      res.status(200).json({ data: geofences });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Get geofences for a specific user
  async getUserGeofences(req, res) {
    try {
      const userId = req.params.userId;

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all devices for this user
      const devices = await DevicesInfo.find({ user: userId }).select('_id');
      const deviceIds = devices.map(device => device._id);

      // Get all geofences for these devices
      const geofences = await Geofence.find({ deviceId: { $in: deviceIds } });

      res.status(200).json({ data: geofences });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Get geofences for a specific device
  async getDeviceGeofences(req, res) {
    try {
      const deviceId = req.params.deviceId;

      // Verify device exists
      const device = await DevicesInfo.findById(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      // Get all geofences for this device
      const geofences = await Geofence.find({ deviceId });

      res.status(200).json({ data: geofences });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Create a new geofence
  async createGeofence(req, res) {
    try {
      const { name, description, center, radius, type, deviceId, color } = req.body;
      // Verify device exists
      const device = await DevicesInfo.findById(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      const newGeofence = new Geofence({
        name,
        description,
        center,
        radius,
        type,
        deviceId,
        color: color || 0xFF4CAF50
      });

      await newGeofence.save();

      // Log geofence creation activity
      await ActivityLogger.logActivity(
        device.user,
        'geofence_created',
        'Geofence Created',
        `New geofence "${name}" created for ${device.devicename}`,
        'success',
        deviceId,
        { geofenceName: name, radius, type }
      );

      res.status(201).json({ message: "Geofence created successfully", data: newGeofence });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Update an existing geofence
  async updateGeofence(req, res) {
    try {
      const geofenceId = req.params.geofenceId;
      const updates = req.body;
      updates.updatedAt = Date.now();

      const geofence = await Geofence.findByIdAndUpdate(
        geofenceId,
        updates,
        { new: true, runValidators: true }
      );

      if (!geofence) {
        return res.status(404).json({ message: "Geofence not found" });
      }

      // Get device info for activity logging
      const device = await DevicesInfo.findById(geofence.deviceId);
      if (device) {
        await ActivityLogger.logActivity(
          device.user,
          'geofence_updated',
          'Geofence Updated',
          `Geofence "${geofence.name}" updated for ${device.devicename}`,
          'success',
          geofence.deviceId,
          { geofenceName: geofence.name, updates: Object.keys(updates) }
        );
      }

      res.status(200).json({ message: "Geofence updated successfully", data: geofence });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Delete a geofence
  async deleteGeofence(req, res) {
    try {
      const geofenceId = req.params.geofenceId;

      const geofence = await Geofence.findById(geofenceId);
      if (!geofence) {
        return res.status(404).json({ message: "Geofence not found" });
      }

      // Get device info for activity logging before deletion
      const device = await DevicesInfo.findById(geofence.deviceId);

      await Geofence.findByIdAndDelete(geofenceId);

      // Log geofence deletion activity
      if (device) {
        await ActivityLogger.logActivity(
          device.user,
          'geofence_deleted',
          'Geofence Deleted',
          `Geofence "${geofence.name}" deleted for ${device.devicename}`,
          'warning',
          geofence.deviceId,
          { geofenceName: geofence.name }
        );
      }

      res.status(200).json({ message: "Geofence deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Check if a device is within any geofences
  async checkGeofences(req, res) {
    try {
      const { deviceId, latitude, longitude } = req.body;

      // Verify device exists
      const device = await DevicesInfo.findById(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      const geofences = await Geofence.find({
        deviceId,
        isActive: true
      });

      const triggeredGeofences = [];

      for (const geofence of geofences) {
        const distance = calculateDistance(
          latitude,
          longitude,
          geofence.center.latitude,
          geofence.center.longitude
        );

        if (distance <= geofence.radius) {
          triggeredGeofences.push(geofence);
        }
      }

      res.status(200).json({ data: triggeredGeofences });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Get geofence analytics for a user
  async getGeofenceAnalytics(req, res) {
    try {
      const userId = req.params.userId;

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all devices for this user
      const devices = await DevicesInfo.find({ user: userId }).select('_id devicename');
      const deviceIds = devices.map(device => device._id);

      // Get geofence statistics
      const totalGeofences = await Geofence.countDocuments({ deviceId: { $in: deviceIds } });
      const activeGeofences = await Geofence.countDocuments({
        deviceId: { $in: deviceIds },
        isActive: true
      });

      // Get geofences by type
      const geofencesByType = await Geofence.aggregate([
        { $match: { deviceId: { $in: deviceIds } } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      // Get recent geofence activities from activity log
      const recentGeofenceActivities = await ActivityLogger.getRecentActivities(
        userId,
        10,
        'geofence_entered'
      );

      const analytics = {
        totalGeofences,
        activeGeofences,
        inactiveGeofences: totalGeofences - activeGeofences,
        geofencesByType: geofencesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentActivities: recentGeofenceActivities,
        devicesWithGeofences: deviceIds.length
      };

      res.status(200).json({ success: true, analytics });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Bulk create geofences
  async bulkCreateGeofences(req, res) {
    try {
      const { geofences } = req.body;

      if (!Array.isArray(geofences) || geofences.length === 0) {
        return res.status(400).json({ message: "Geofences array is required" });
      }

      const createdGeofences = [];
      const errors = [];

      for (let i = 0; i < geofences.length; i++) {
        try {
          const { name, description, center, radius, type, deviceId, color } = geofences[i];

          // Verify device exists
          const device = await DevicesInfo.findById(deviceId);
          if (!device) {
            errors.push({ index: i, error: "Device not found" });
            continue;
          }

          const newGeofence = new Geofence({
            name,
            description,
            center,
            radius,
            type,
            deviceId,
            color: color || 0xFF4CAF50
          });

          await newGeofence.save();
          createdGeofences.push(newGeofence);

          // Log activity
          await ActivityLogger.logActivity(
            device.user,
            'geofence_created',
            'Geofence Created',
            `Bulk created geofence "${name}" for ${device.devicename}`,
            'success',
            deviceId,
            { geofenceName: name, radius, type, bulkOperation: true }
          );

        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.status(201).json({
        message: `Bulk operation completed. ${createdGeofences.length} geofences created.`,
        created: createdGeofences,
        errors: errors
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Toggle geofence active status
  async toggleGeofenceStatus(req, res) {
    try {
      const geofenceId = req.params.geofenceId;

      const geofence = await Geofence.findById(geofenceId);
      if (!geofence) {
        return res.status(404).json({ message: "Geofence not found" });
      }

      // Toggle active status
      geofence.isActive = !geofence.isActive;
      geofence.updatedAt = Date.now();
      await geofence.save();

      // Get device info for activity logging
      const device = await DevicesInfo.findById(geofence.deviceId);
      if (device) {
        await ActivityLogger.logActivity(
          device.user,
          'geofence_updated',
          'Geofence Status Changed',
          `Geofence "${geofence.name}" ${geofence.isActive ? 'activated' : 'deactivated'} for ${device.devicename}`,
          'info',
          geofence.deviceId,
          { geofenceName: geofence.name, newStatus: geofence.isActive }
        );
      }

      res.status(200).json({
        message: `Geofence ${geofence.isActive ? 'activated' : 'deactivated'} successfully`,
        data: geofence
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Get geofence history for a user
  async getGeofenceHistory(req, res) {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit) || 50;
      const eventType = req.query.eventType; // Optional filter

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Build query
      const query = { userId };
      if (eventType) {
        query.eventType = eventType;
      }

      // Get geofence history
      const history = await GeofenceHistory.find(query)
        .populate('deviceId', 'devicename modelNumber')
        .populate('geofenceId', 'name type')
        .sort({ timestamp: -1 })
        .limit(limit);

      res.status(200).json({ success: true, history });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Get geofence history for a specific device
  async getDeviceGeofenceHistory(req, res) {
    try {
      const deviceId = req.params.deviceId;
      const limit = parseInt(req.query.limit) || 50;

      // Verify device exists
      const device = await DevicesInfo.findById(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      // Get geofence history for this device
      const history = await GeofenceHistory.find({ deviceId })
        .populate('geofenceId', 'name type')
        .sort({ timestamp: -1 })
        .limit(limit);

      res.status(200).json({ success: true, history });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Get geofence statistics
  async getGeofenceStats(req, res) {
    try {
      const userId = req.params.userId;

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all devices for this user
      const devices = await DevicesInfo.find({ user: userId }).select('_id');
      const deviceIds = devices.map(device => device._id);

      // Get statistics
      const totalEvents = await GeofenceHistory.countDocuments({ userId });
      const entriesCount = await GeofenceHistory.countDocuments({ userId, eventType: 'entered' });
      const exitsCount = await GeofenceHistory.countDocuments({ userId, eventType: 'exited' });

      // Get events by device
      const eventsByDevice = await GeofenceHistory.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$deviceId', count: { $sum: 1 } } },
        { $lookup: { from: 'devicesinfos', localField: '_id', foreignField: '_id', as: 'device' } },
        { $unwind: '$device' },
        { $project: { deviceName: '$device.devicename', count: 1 } }
      ]);

      // Get recent activity (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentActivity = await GeofenceHistory.countDocuments({
        userId,
        timestamp: { $gte: twentyFourHoursAgo }
      });

      const stats = {
        totalEvents,
        entriesCount,
        exitsCount,
        eventsByDevice,
        recentActivity,
        devicesCount: deviceIds.length
      };

      res.status(200).json({ success: true, stats });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  }
};

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = 6371000.0; // Earth radius in meters

  const a = 0.5 -
      Math.cos((lat2 - lat1) * p) / 2 +
      Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p)) / 2;

  return 2 * c * Math.asin(Math.sqrt(a)); // Distance in meters
}

// Export the function for use in other controllers
const checkDeviceGeofences = async (deviceId, latitude, longitude) => {
  try {
    const geofences = await Geofence.find({
      deviceId,
      isActive: true
    });

    const triggeredGeofences = [];

    for (const geofence of geofences) {
      const distance = calculateDistance(
        latitude,
        longitude,
        geofence.center.latitude,
        geofence.center.longitude
      );

      if (distance <= geofence.radius) {
        triggeredGeofences.push(geofence);
      }
    }

    return triggeredGeofences;
  } catch (error) {
    console.error("Error checking geofences:", error);
    return [];
  }
};

module.exports = geofenceController;
module.exports.checkDeviceGeofences = checkDeviceGeofences;
module.exports.calculateDistance = calculateDistance;
