const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification");

// Register a device token for push notifications
router.post("/api/notifications/register-token", notificationController.registerDeviceToken);

// Unregister a device token
router.post("/api/notifications/unregister-token", notificationController.unregisterDeviceToken);

// Update notification settings
router.put("/api/notifications/settings/:userId", notificationController.updateNotificationSettings);

// Get notification settings
router.get("/api/notifications/settings/:userId", notificationController.getNotificationSettings);

// Send a test notification
router.post("/api/notifications/test/:userId", notificationController.sendTestNotification);

module.exports = router;
