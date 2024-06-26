const mongoose = require("mongoose");

const PasswordResetSchema = new mongoose.Schema({
  userId: String,
  verificationCode: String,
  createdAt: Date,
  expiresAt: Date,
});

const PasswordReset = mongoose.model("PasswordReset", PasswordResetSchema);

module.exports =  PasswordReset;
