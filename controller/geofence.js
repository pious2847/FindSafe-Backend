const Geofence = require('../models/geofence');
const DevicesInfo = require('../models/deviceinfo');
const User = require('../models/users');
const { sendCommandToDevice } = require('../utils/websocket');
const notificationService = require('../utils/notification_service');

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

      res.status(200).json({ message: "Geofence updated successfully", data: geofence });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  },

  // Delete a geofence
  async deleteGeofence(req, res) {
    try {
      const geofenceId = req.params.geofenceId;

      const geofence = await Geofence.findByIdAndDelete(geofenceId);

      if (!geofence) {
        return res.status(404).json({ message: "Geofence not found" });
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
geofenceController.checkDeviceGeofences = async (deviceId, latitude, longitude) => {
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
