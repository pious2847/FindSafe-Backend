// user.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  addressinfo:{
    area:{
      type: String,
      trim: true
    },
    houseNo:{
      type: String,
      trim: true
    },
  },
  emergencycontact:{
    name: {
      type: String,
      trim: true
    },
    contact:{
    type: String,
    trim: true,
    required: true,
    }
  },
  verified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  devices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
    },
  ],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
