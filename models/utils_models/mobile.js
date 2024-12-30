const mongoose = require("mongoose");

const MobileDeviceSchema = new mongoose.Schema({
devicename: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

const MobileDevice = mongoose.model('MobileDevice', MobileDeviceSchema);

module.exports = MobileDevice;
