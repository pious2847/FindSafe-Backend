const express = require("express");
const router = express.Router();
const geofenceController = require("../controller/geofence");

// Get all geofences
router.get("/api/geofences", geofenceController.getGeofences);

// Get geofences for a specific user
router.get("/api/geofences/user/:userId", geofenceController.getUserGeofences);

// Get geofences for a specific device
router.get("/api/geofences/device/:deviceId", geofenceController.getDeviceGeofences);

// Create a new geofence
router.post("/api/geofences", geofenceController.createGeofence);

// Update an existing geofence
router.put("/api/geofences/:geofenceId", geofenceController.updateGeofence);

// Delete a geofence
router.delete("/api/geofences/:geofenceId", geofenceController.deleteGeofence);

// Check if a device is within any geofences
router.post("/api/geofences/check", geofenceController.checkGeofences);

module.exports = router;
