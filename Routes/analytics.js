const express = require("express");
const router = express.Router();
const analyticsController = require("../controller/analytics");

// Get dashboard statistics for a user
router.get("/api/analytics/dashboard/:userId", analyticsController.getDashboardStats);

// Get recent activity for a user
router.get("/api/analytics/activity/:userId", analyticsController.getRecentActivity);

// Get system performance metrics
router.get("/api/analytics/performance/:userId", analyticsController.getPerformanceMetrics);

// Get device analytics
router.get("/api/analytics/devices/:userId", analyticsController.getDeviceAnalytics);

// Get location analytics
router.get("/api/analytics/locations/:userId", analyticsController.getLocationAnalytics);

// Get security analytics
router.get("/api/analytics/security/:userId", analyticsController.getSecurityAnalytics);

module.exports = router;
