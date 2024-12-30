const express = require("express");
const router = express.Router();
const MobileDevice = require("../models/utils_models/mobile");
const DevicesInfo = require("../models/deviceinfo");
const Location = require("../models/locations");
const User = require("../models/users");
const bcrypt = require('bcrypt');
const { sendEmail } =  require('../utils/MailSender');
const { sendCommandToDevice, getConnectedDevices }= require('../utils/websocket');
const deviceController = require("../controller/device");

router.get("/api/mobiledevices", deviceController.getDevices);
router.get("/api/mobiledevices/:userId", deviceController.getUserDevice);

// GET /api/devices/:deviceId/mode
router.get("/api/devices/:deviceId/mode", async (req, res) => {
  try {
    const device = await DevicesInfo.findById(req.params.deviceId)
      .select("mode activationCode devicename modelNumber")
      .populate("user", "name email");

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json({
      mode: device.mode,
      activationCode: device.activationCode,
      deviceName: device.devicename,
      modelNumber: device.modelNumber,
      user: device.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update device mode
router.post("/api/devicemode/:userId/:deviceId", deviceController.updateDeviceMode);

router.post("/api/mobiledevices", deviceController.createDevice);

// Get recent location history for a device
router.get("/api/mobiledevices/:deviceId/locations", async (req, res) => {
  const deviceId = req.params.deviceId;

  try {
    const device = await DevicesInfo.findById(deviceId).populate(
      "locationHistory"
    );

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    const locationHistory = await Location.find({
      _id: { $in: device.locationHistory },
    }).sort({ timestamp: -1 });

    res.status(200).json(locationHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch location history" });
  }
});

// api/register-device/:userId/:devicename/:modelNumber
router.post(
  "/api/register-device/:userId/:devicename/:modelNumber",
  async (req, res) => {
    try {
      const { userId, devicename, modelNumber } = req.params;

      let deviceimage = "";
      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(400)
          .json({ message: "User not Found, please login" });
      }

      const deviceExists = await DevicesInfo.findOne({
        devicename: devicename,
      });

      const deciveimgurl = await MobileDevice.findOne({
        devicename: devicename,
      });

      if (deciveimgurl) {
        deviceimage = deciveimgurl.imageUrl;
      }
      if (!deciveimgurl) {
        deviceimage =
          "https://static.vecteezy.com/system/resources/previews/002/249/888/large_2x/illustration-of-phone-screen-icon-free-vector.jpg";
      }

      const device = new DevicesInfo({
        user: userId,
        devicename: devicename,
        modelNumber: modelNumber,
        image: deviceimage,
      });

      await device.save();

      user.devices.push(device._id);

      user.save();

      res
        .status(200)
        .json({ message: "Location added successfully", deviceId: device._id });
    } catch (error) {
      res.status(500).json({ error: "An error occurred: " + error.message });
    }
  }
);

// Register device location
router.post("/api/register-location/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { latitude, longitude } = req.body;
    // console.log(req.body);

    const device = await DevicesInfo.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Create a new location document
    const newLocation = new Location({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });
    await newLocation.save();

    // Update the device's current location and push the new location to the history
    if (device.curretlocation) {
      // If currentLocation is not null, push it to the locationHistory
      device.locationHistory.push(device.curretlocation);
    }
    device.curretlocation = newLocation._id;
    device.locationHistory.push(newLocation._id);
    await device.save();

    res.status(201).json({ message: "Location added successfully" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});


// Update device location
router.post("/api/update-location", async (req, res) => {
  try {
    const { deviceId, latitude, longitude } = req.body;

    // Find the device by its ID
    const device = await DevicesInfo.findById(deviceId);

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Create a new location document
    const newLocation = new Location({ latitude, longitude });
    await newLocation.save();

    // Update the device's current location and push the previous location to the history
    device.curretlocation = newLocation._id;
    const  currentlochiscount = device.locationHistory.length;

    if( currentlochiscount >= 30){
     device.locationHistory.shift();
    }
    device.locationHistory.push(device.curretlocation);
    await device.save();

    res.status(200).json({ message: "Location updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Validate user activation code
router.post("/api/:deviceId/validate-activation-code", (req, res) => {
  const { deviceId } = req.params.deviceId;
  const { activationCode } = req.body;

  try {
    const Device = DevicesInfo.findById(deviceId);

    if (!Device) {
      res.status(404).json({ error: "Device not found" });
    }
    if (activationCode === Device.activationCode) {
      res
        .status(200)
        .json({ message: "Activation completed sucessfully", isValid: true });
    } else {
      res
        .status(400)
        .json({ message: "Invalid Activation code", isValid: false });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Internal sever Error ${error}`, isValid: false });
  }
});

// Delte device by id
router.delete("/api/deletedevice/:deviceId", async (req, res) => {
  const deviceId = req.params.deviceId;

  try {
    const device = await DevicesInfo.findOne({ _id: deviceId });

    if (!device) {
      res.send(404).send({ message: "Device not found" });
    }
    await DevicesInfo.findByIdAndDelete(deviceId);
    res.status(200).send({ message: "Device deleted Sucessfully" });
  } catch (error) {
    res
      .status(500)
      .send({ message: `An error occurred while deleting ${error}  ` });
  }
});


// ================== Device Sudo Command ====================//

router.post('/api/device/:deviceId/alarm', (req, res) => {
  const { deviceId } = req.params;
  
  if (sendCommandToDevice(deviceId, 'play_alarm')) {
    res.json({ success: true, message: 'Alarm command sent successfully' });
  } else {
    res.status(404).json({ success: false, message: 'Device not found or not connected' });
  }
});

router.get('/api/connected-devices', (req, res) => {
  const devices = getConnectedDevices();
  res.json({ success: true, devices });
});

module.exports = router;
