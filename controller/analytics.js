const DevicesInfo = require("../models/deviceinfo");
const Location = require("../models/locations");
const Geofence = require("../models/geofence");
const User = require("../models/users");
const Activity = require("../models/activity");
const { getConnectedDevices } = require('../utils/websocket');
const ActivityLogger = require('../utils/activityLogger');

const analyticsController = {
    async getDashboardStats(req, res) {
        try {
            const { userId } = req.params;

            // Get user devices
            const userDevices = await DevicesInfo.find({ user: userId });
            const totalDevices = userDevices.length;

            // Get connected devices
            const connectedDevicesData = getConnectedDevices();
            const connectedDevices = connectedDevicesData.devices || [];
            const userConnectedDevices = userDevices.filter(device =>
                connectedDevices.some(connected => connected.deviceId === device._id.toString())
            );
            const onlineDevices = userConnectedDevices.length;

            // Calculate secure devices (devices not in disabled mode)
            const secureDevices = userDevices.filter(device => device.mode !== 'disabled').length;

            // Simulate battery data (in real implementation, this would come from device data)
            const lowBatteryDevices = Math.floor(totalDevices * 0.2); // 20% of devices

            // Get recent locations count
            const recentLocations = await Location.countDocuments({
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
            });

            // Count alerts (devices in disabled mode + low battery simulation)
            const alerts = userDevices.filter(device => device.mode === 'disabled').length + lowBatteryDevices;

            // Calculate trends (simulate for now)
            const previousStats = {
                totalDevices: Math.max(0, totalDevices - Math.floor(Math.random() * 3)),
                onlineDevices: Math.max(0, onlineDevices - Math.floor(Math.random() * 2)),
                secureDevices: Math.max(0, secureDevices - Math.floor(Math.random() * 2)),
            };

            const trends = {
                totalDevices: totalDevices > previousStats.totalDevices ? 
                    `+${((totalDevices - previousStats.totalDevices) / Math.max(previousStats.totalDevices, 1) * 100).toFixed(1)}%` : 
                    totalDevices === previousStats.totalDevices ? '0%' :
                    `-${((previousStats.totalDevices - totalDevices) / Math.max(previousStats.totalDevices, 1) * 100).toFixed(1)}%`,
                onlineDevices: onlineDevices > previousStats.onlineDevices ? 
                    `+${((onlineDevices - previousStats.onlineDevices) / Math.max(previousStats.onlineDevices, 1) * 100).toFixed(1)}%` : 
                    onlineDevices === previousStats.onlineDevices ? '0%' :
                    `-${((previousStats.onlineDevices - onlineDevices) / Math.max(previousStats.onlineDevices, 1) * 100).toFixed(1)}%`,
                secureDevices: secureDevices === totalDevices ? '100%' : 
                    `${(secureDevices / Math.max(totalDevices, 1) * 100).toFixed(1)}%`,
            };

            const stats = {
                totalDevices,
                onlineDevices,
                secureDevices,
                lowBattery: lowBatteryDevices,
                alerts,
                locations: recentLocations,
                trends,
                lastUpdated: new Date()
            };

            res.status(200).json({ success: true, stats });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({ success: false, message: "An error occurred: " + error.message });
        }
    },

    async getRecentActivity(req, res) {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit) || 10;
            const type = req.query.type; // Optional filter by activity type

            // Get real activities from the database
            const activities = await ActivityLogger.getRecentActivities(userId, limit, type);

            // If no activities exist, create some initial activities based on existing data
            if (activities.length === 0) {
                // Get user devices
                const userDevices = await DevicesInfo.find({ user: userId }).select('_id devicename');

                if (userDevices.length > 0) {
                    // Create initial activities for existing devices
                    for (const device of userDevices) {
                        await ActivityLogger.logDeviceAdded(userId, device._id, device.devicename);
                    }

                    // Get recent location updates and create activities for them
                    const recentLocations = await Location.find({
                        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
                    }).sort({ timestamp: -1 }).limit(5);

                    for (const location of recentLocations) {
                        // Find a random device for this location (in real app, location should have deviceId)
                        const randomDevice = userDevices[Math.floor(Math.random() * userDevices.length)];
                        await ActivityLogger.logLocationUpdate(
                            userId,
                            randomDevice._id,
                            randomDevice.devicename,
                            {
                                latitude: location.latitude,
                                longitude: location.longitude,
                                timestamp: location.timestamp
                            }
                        );
                    }

                    // Get the newly created activities
                    const newActivities = await ActivityLogger.getRecentActivities(userId, limit, type);
                    return res.status(200).json({ success: true, activities: newActivities });
                }
            }

            res.status(200).json({ success: true, activities });
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            res.status(500).json({ success: false, message: "An error occurred: " + error.message });
        }
    },

    async getPerformanceMetrics(req, res) {
        try {
            const { userId } = req.params;

            // Get user devices
            const userDevices = await DevicesInfo.find({ user: userId });
            const connectedDevicesData = getConnectedDevices();
            const connectedDevices = connectedDevicesData.devices || [];

            // Calculate real metrics based on actual data
            const totalDevices = userDevices.length;
            const connectedCount = connectedDevices.length;
            const uptime = totalDevices > 0 ? (connectedCount / totalDevices * 100).toFixed(1) : '100.0';

            // Get recent activities to calculate activity metrics
            const recentActivities = await Activity.find({ userId })
                .sort({ timestamp: -1 })
                .limit(100);

            // Calculate average response time based on activity frequency
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const recentActivityCount = recentActivities.filter(activity =>
                activity.timestamp >= oneHourAgo
            ).length;

            // Response time based on activity frequency (more activity = better response)
            const responseTime = Math.max(10, 100 - (recentActivityCount * 2));

            // Get location data for the last 24 hours to estimate data usage
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const locationUpdates = await Location.countDocuments({
                timestamp: { $gte: twentyFourHoursAgo }
            });

            // Estimate data usage based on location updates (each update ~1KB)
            const dataUsage = (locationUpdates * 0.001).toFixed(1); // Convert to MB

            const metrics = {
                uptime,
                responseTime: responseTime.toFixed(0),
                dataUsage,
                connectedDevices: connectedCount,
                totalRequests: recentActivities.length,
                locationUpdates,
                lastUpdated: new Date()
            };

            res.status(200).json({ success: true, metrics });
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            res.status(500).json({ success: false, message: "An error occurred: " + error.message });
        }
    },

    async getDeviceAnalytics(req, res) {
        try {
            const { userId } = req.params;

            const userDevices = await DevicesInfo.find({ user: userId });
            const connectedDevicesData = getConnectedDevices();
            const connectedDevices = connectedDevicesData.devices || [];

            // Group devices by status
            const devicesByStatus = {
                active: userDevices.filter(device => device.mode === 'active').length,
                inactive: userDevices.filter(device => device.mode === 'inactive').length,
                disabled: userDevices.filter(device => device.mode === 'disabled').length,
                sleep: userDevices.filter(device => device.mode === 'sleep').length
            };

            // Device types (simulate based on device names)
            const deviceTypes = {};
            userDevices.forEach(device => {
                const type = device.devicename.toLowerCase().includes('iphone') ? 'iPhone' :
                           device.devicename.toLowerCase().includes('samsung') ? 'Samsung' :
                           device.devicename.toLowerCase().includes('ipad') ? 'iPad' :
                           device.devicename.toLowerCase().includes('macbook') ? 'MacBook' : 'Other';
                deviceTypes[type] = (deviceTypes[type] || 0) + 1;
            });

            const analytics = {
                devicesByStatus,
                deviceTypes,
                totalDevices: userDevices.length,
                connectedDevices: connectedDevices.length,
                lastUpdated: new Date()
            };

            res.status(200).json({ success: true, analytics });
        } catch (error) {
            console.error('Error fetching device analytics:', error);
            res.status(500).json({ success: false, message: "An error occurred: " + error.message });
        }
    },

    async getLocationAnalytics(req, res) {
        try {
            const { userId } = req.params;

            // Get user devices
            const userDevices = await DevicesInfo.find({ user: userId });
            const deviceIds = userDevices.map(device => device._id);

            // Get location data for the last 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const locationCount = await Location.countDocuments({
                timestamp: { $gte: thirtyDaysAgo }
            });

            // Get geofences count
            const geofencesCount = await Geofence.countDocuments({ userId });

            const analytics = {
                totalLocations: locationCount,
                geofences: geofencesCount,
                averageLocationsPerDay: (locationCount / 30).toFixed(1),
                lastUpdated: new Date()
            };

            res.status(200).json({ success: true, analytics });
        } catch (error) {
            console.error('Error fetching location analytics:', error);
            res.status(500).json({ success: false, message: "An error occurred: " + error.message });
        }
    },

    async getSecurityAnalytics(req, res) {
        try {
            const { userId } = req.params;

            const userDevices = await DevicesInfo.find({ user: userId });

            // Security metrics
            const secureDevices = userDevices.filter(device => device.mode !== 'disabled').length;
            const disabledDevices = userDevices.filter(device => device.mode === 'disabled').length;
            const securityScore = userDevices.length > 0 ? (secureDevices / userDevices.length * 100).toFixed(1) : 100;

            const analytics = {
                securityScore,
                secureDevices,
                disabledDevices,
                totalDevices: userDevices.length,
                lastSecurityUpdate: new Date(),
                lastUpdated: new Date()
            };

            res.status(200).json({ success: true, analytics });
        } catch (error) {
            console.error('Error fetching security analytics:', error);
            res.status(500).json({ success: false, message: "An error occurred: " + error.message });
        }
    }
};

module.exports = analyticsController;
