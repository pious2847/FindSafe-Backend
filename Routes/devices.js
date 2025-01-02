const express = require("express");
const router = express.Router();
const deviceController = require("../controller/device");

router.get("/api/mobiledevices", deviceController.getDevices);
router.get("/api/mobiledevices/:userId", deviceController.getUserDevice);
router.get("/api/devices/:deviceId/mode", deviceController.getDeviceCurrentMode);

router.post("/api/devicemode/:userId/:deviceId", deviceController.updateDeviceMode);
router.post("/api/mobiledevices", deviceController.createDevice);
router.post("/api/register-device/:userId/:devicename/:modelNumber",
  deviceController.registerNewDevice
);
router.post("/api/:deviceId/validate-activation-code", deviceController.activateAndUnlockDevice);

router.delete("/api/deletedevice/:deviceId", deviceController.deleteDevice);





// ================== Device Sudo Command ====================//

router.post('/api/device/:deviceId/alarm', deviceController.triggerAlarm);
router.get('/api/connected-devices', deviceController.getConnectedDevice);

module.exports = router;
