const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    require: true,
  },
  phone: {
    type: String,
    trim: true,
    require: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    require: true,
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

  Devices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "devices",
    },
  ],
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
