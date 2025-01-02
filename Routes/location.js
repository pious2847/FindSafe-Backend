const express = require("express");
const router = express.Router();
const DevicesInfo = require("../models/deviceinfo");
const Location = require("../models/locations");
const locationController = require("../controller/location");


router.get("/api/mobiledevices/:deviceId/locations", locationController.getdeviceLocations);
// Register device location
router.post("/api/register-location/:deviceId", locationController.registerDeviceLocation);
// Update device location
router.post("/api/update-location", locationController.updateDeviceCurrentLocation);


module.exports = router