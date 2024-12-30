
const MobileDevice = require("../models/utils_models/mobile");
const DevicesInfo = require("../models/deviceinfo");
const Location = require("../models/locations");
const User = require("../models/users");
const bcrypt = require('bcrypt');
const { sendEmail, sendVerificationEmail } = require('../utils/MailSender');
const { sendCommandToDevice, getConnectedDevices } = require('../utils/websocket');
const { generateAccountVerification, generateLostModeNotification, generateDeviceFoundNotification } = require("../utils/messages");

const deviceController = {
    async getDevices(req, res) {
        try {
            // Find all mobile devices
            const mobileDevices = await MobileDevice.find();

            res.status(200).json({ mobileDevices });

            // console.log(mobileDevices);
        } catch (error) {
            res.status(500).json({ message: "An error occurred: " + error.message });
        }
    },
    async getUserDevice(req, res) {
        try {
            const userId = req.params.userId;

            const mobileDevices = await DevicesInfo.find({ user: userId }).sort({ _id: -1 });

            ;
            res.status(200).json({ mobileDevices });
        } catch (error) {
            res.status(500).json({ message: "An error occurred: " + error.message });
        }
    },
    async createDevice(req, res) {
        try {
            const { devicename, imageUrl } = req.body;

            // Check if the device already exists
            const existingDevice = await MobileDevice.findOne({ devicename });

            if (existingDevice) {
                return res.status(400).json({ error: "Device already exists" });
            }

            // Create a new device entry
            const newDevice = new MobileDevice({
                devicename,
                imageUrl,
            });

            // Save the new device entry
            await newDevice.save();

            res
                .status(200)
                .json({ message: "Device added successfully", device: newDevice });
        } catch (error) {
            res.status(500).json({ message: "An error occurred: " + error.message });
        }
    },
    async updateDeviceMode(req, res) {
        const { userId, deviceId } = req.params;
        const { mode } = req.body;

        try {
            // Validate input parameters
            if (!userId || !deviceId || !mode) {
                return res.status(400).json({
                    message: "Missing required parameters"
                });
            }

            // Validate mode value
            const validModes = ['active', 'disable'];
            if (!validModes.includes(mode)) {
                return res.status(400).json({
                    message: "Invalid mode value"
                });
            }

            // Find user and device in parallel
            const [user, device] = await Promise.all([
                User.findById(userId),
                DevicesInfo.findById(deviceId)
            ]);

            // Check if both user and device exist
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (!device) {
                return res.status(404).json({ message: "Device not found" });
            }

            // Verify device belongs to user
            if (!user.devices.includes(deviceId)) {
                return res.status(403).json({
                    message: "Not authorized to modify this device"
                });
            }

            // Update device mode
            device.mode = mode;
            await device.save();

            // Handle email notifications
            try {
                if (mode === 'disable') {

                    const message = generateLostModeNotification(user, device,);
                    await Promise.all([
                        sendVerificationEmail(user.email, user, 'System Secured Alert', res, `${mode} mode activated successfully`),
                        sendEmail(user.email, 'System Alert Notification', message)
                    ]);
                } else {
                    const message = generateDeviceFoundNotification(user, device);
                    await sendEmail(user.email, 'System Alert Notification', message);
                }
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Continue with response even if email fails
            }

            return res.status(200).json({
                message: `Device mode successfully updated to ${mode}`,
                device: {
                    id: device._id,
                    name: device.devicename,
                    mode: device.mode
                }
            });

        } catch (error) {
            console.error('Update device mode error:', error);
            return res.status(500).json({
                message: "An error occurred while updating device mode",
                error: error.message
            });
        }
    },
    
}

module.exports = deviceController;
