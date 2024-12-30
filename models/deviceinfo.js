// device.js
const mongoose = require("mongoose");

const DevicesInfo = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  devicename: {
    type: String,
    trim: true,
    required: true
  },
  mode: {
    type: String,
    trim: true,
    default: 'active',
  },
  activationCode: {
    type: String,
    trim: true,
    default: ' ',
  },
  modelNumber: {
    type: String,
    trim: true
  },
  curretlocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null 
  },
  locationHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  image: {
    type: String,
    required: true
  }
});

const Devices = mongoose.model('Devices', DevicesInfo);

module.exports = Devices;
