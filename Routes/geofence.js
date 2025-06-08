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

// Get geofence analytics for a user
router.get("/api/geofences/analytics/:userId", geofenceController.getGeofenceAnalytics);

// Bulk create geofences
router.post("/api/geofences/bulk", geofenceController.bulkCreateGeofences);

// Toggle geofence active status
router.patch("/api/geofences/:geofenceId/toggle", geofenceController.toggleGeofenceStatus);

// Get geofence history for a user
router.get("/api/geofences/history/user/:userId", geofenceController.getGeofenceHistory);

// Get geofence history for a specific device
router.get("/api/geofences/history/device/:deviceId", geofenceController.getDeviceGeofenceHistory);

// Get geofence statistics for a user
router.get("/api/geofences/stats/:userId", geofenceController.getGeofenceStats);

module.exports = router;
