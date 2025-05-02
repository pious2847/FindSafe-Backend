// user.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  profilePictureId: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default :''
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
      trim: true,
      default: ''
    },
    houseNo:{
      type: String,
      trim: true,
      default:  ''
    },
  },
  emergencycontact:{
    name: {
      type: String,
      trim: true,
      default:''
    },
    contact:{
    type: String,
    trim: true,
    default: ''
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
      ref: "Devices",
    },
  ],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
