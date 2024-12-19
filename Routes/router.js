const express = require("express");
const router = express.Router();
const MobileDevice = require("../models/utils_models/mobile");
const DevicesInfo = require("../models/deviceinfo");
const Location = require("../models/locations");
const User = require("../models/users");
const bcrypt = require('bcrypt');
const { sendEmail } =  require('../utils/MailSender');
const { sendCommandToDevice, getConnectedDevices }= require('../utils/websocket')

router.get("/api/mobiledevices", async (req, res) => {
  try {
    // Find all mobile devices
    const mobileDevices = await MobileDevice.find();

    res.status(200).json({ mobileDevices });

    // console.log(mobileDevices);
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// Find all mobile devices oof user
router.get("/api/mobiledevices/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const mobileDevices = await DevicesInfo.find({ user: userId }).sort({ _id: -1 });

    // console.log(mobileDevices);
    res.status(200).json({ mobileDevices });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

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
router.post("/api/devicemode/:userId/:deviceId", async (req, res) => {
  const { userId, deviceId } = req.params;
  const { mode } = req.body;
  try {
   
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log(userId);
   
    const mobileDevices = await DevicesInfo.findOne({ _id: deviceId });
    // console.log(mobileDevices);

    if (!mobileDevices) {
      return res.status(404).json({ message: "No devices found" });
    }
    mobileDevices.mode = mode;
    await mobileDevices.save(); // Use await since save() is an async operation
   
    if (mode === 'disable'){
      const verificationCode = `${Math.floor(100000 + Math.random() * 900000)}`;
      const salt = 10;
      const ActivationCode = await bcrypt.hash(verificationCode, salt);
      const message = `
      <div>
      <blockquote style="border-left: 2px solid #007BFF; padding-left: 13px; color: #555; font-size: 13px; line-height: 1.6;">Your ${mobileDevices.devicename} is currently in disabled mode due to security reasons. To unlock and activate your device, please enter the activation code provided below: <br>
      <br>
      Activation Code: <span style = " padding: 6px; background-color:  #70bcef; border-radius: 5px; color: white;"> ${verificationCode}</span> <br>
      <br>
      Please enter the activation code exactly as shown to complete the activation process. If you encounter any issues or have questions, please contact our support team for further assistance <br>
      <br>
      Thank you for your cooperation. <br>
      <br>
      SmartTech Solutions
      </blockquote>
      </div>
  
      `
    await sendEmail(user.name, user.email, "System Disable Alert", message);  
    }
 
    if (mode === "active") {
      return res
        .status(200)
        .json({ message: "Active mode activated successfully" });
    } else {
      return res
        .status(200)
        .json({ message: "Lost mode activated successfully" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "An error occurred: " + error.message });
  }
});

// create a new device
router.post("/api/mobiledevices", async (req, res) => {
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
});

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
