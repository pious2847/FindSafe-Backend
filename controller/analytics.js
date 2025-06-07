const DevicesInfo = require("../models/deviceinfo");
const Location = require("../models/locations");
const Geofence = require("../models/geofence");
const User = require("../models/users");
const { getConnectedDevices } = require('../utils/websocket');

const analyticsController = {
    async getDashboardStats(req, res) {
        try {
            const { userId } = req.params;

            // Get user devices
            const userDevices = await DevicesInfo.find({ user: userId });
            const totalDevices = userDevices.length;

            // Get connected devices
            const connectedDevices = getConnectedDevices();
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

            // Get user devices for filtering
            const userDevices = await DevicesInfo.find({ user: userId }).select('_id devicename');
            const deviceIds = userDevices.map(device => device._id);

            // Get recent location updates
            const recentLocations = await Location.find({
                timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
            }).sort({ timestamp: -1 }).limit(limit);

            // Get device mode changes (simulate activity log)
            const activities = [];

            // Add location updates as activities
            for (const location of recentLocations.slice(0, 5)) {
                const device = userDevices[Math.floor(Math.random() * userDevices.length)];
                activities.push({
                    id: location._id,
                    type: 'location_update',
                    title: 'Location Updated',
                    description: `${device.devicename} location updated`,
                    timestamp: location.timestamp,
                    device: device.devicename,
                    status: 'info'
                });
            }

            // Add simulated device activities
            const deviceActivities = [
                {
                    type: 'device_connected',
                    title: 'Device Connected',
                    status: 'success'
                },
                {
                    type: 'security_alert',
                    title: 'Security Alert',
                    status: 'warning'
                },
                {
                    type: 'battery_low',
                    title: 'Low Battery Alert',
                    status: 'warning'
                },
                {
                    type: 'profile_update',
                    title: 'Profile Updated',
                    status: 'success'
                }
            ];

            // Add simulated activities
            for (let i = 0; i < Math.min(5, limit - activities.length); i++) {
                const activity = deviceActivities[Math.floor(Math.random() * deviceActivities.length)];
                const device = userDevices[Math.floor(Math.random() * userDevices.length)];
                const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);

                activities.push({
                    id: `activity_${Date.now()}_${i}`,
                    type: activity.type,
                    title: activity.title,
                    description: `${activity.title} for ${device.devicename}`,
                    timestamp,
                    device: device.devicename,
                    status: activity.status
                });
            }

            // Sort by timestamp
            activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            res.status(200).json({ success: true, activities: activities.slice(0, limit) });
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
            const connectedDevices = getConnectedDevices();

            // Calculate uptime (simulate)
            const uptime = Math.random() * 5 + 95; // 95-100%

            // Calculate response time (simulate)
            const responseTime = Math.random() * 50 + 10; // 10-60ms

            // Calculate data usage (simulate)
            const dataUsage = Math.random() * 100 + 50; // 50-150MB

            const metrics = {
                uptime: uptime.toFixed(1),
                responseTime: responseTime.toFixed(0),
                dataUsage: dataUsage.toFixed(1),
                connectedDevices: connectedDevices.length,
                totalRequests: Math.floor(Math.random() * 1000) + 500,
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
            const connectedDevices = getConnectedDevices();

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
