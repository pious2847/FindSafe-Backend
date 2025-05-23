const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const PasswordReset = require("../models/utils_models/PasswordReset");
const Users = require("../models/users");
const axios = require("axios");
const generateOTP = require("./codesGen").generateOTP; // Import the generateOTP function
const { 
  generateAccountVerification, 
  generatePasswordResetConfirmation, 
  generateForgotPasswordEmail,
  generatePasswordResetSuccess 
} = require("./messages");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.AUTH_EMAIL, pass: process.env.AUTH_PASS },
});

/**
 * Sends a password reset email with a verification code.
 * @param {string} email - The email address of the user.
 * @param {Object} user - The user object.
 * @param {Object} res - The response object.
 * @param {string} resMessage - The response message to be sent.
 * @returns {Object} JSON response with status and message.
 */
const sendVerificationEmail = async (email, user, subject, res, resMessage) => {
  if (!user) {
    return res.status(400).json({ message: "Account not found" });
  }

  const verificationCode = generateOTP();
  const message = generateAccountVerification(user, verificationCode);

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: subject,
    html: message,
  };

  try {
    await PasswordReset.deleteMany({ userId: user._id });
    const salt = 10;
    const hashedVerificationCode = await bcrypt.hash(verificationCode.toString(), salt);

    const newPasswordReset = new PasswordReset({
      userId: user._id,
      verificationCode: hashedVerificationCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour in milliseconds
    });

    await newPasswordReset.save();
    await transporter.sendMail(mailOptions);
    return { message: resMessage, success: true };
  } catch (error) {
    console.error(error);
    return { message: "Error sending verification code", success: false };
  }
};

/**
 * Sends a forgot password email with OTP
 * @param {string} email - The email address of the user.
 * @param {Object} user - The user object.
 * @returns {Object} Response with status and message.
 */
const sendForgotPasswordEmail = async (email, user) => {
  if (!user) {
    return { message: "Account not found", success: false };
  }

  const resetCode = generateOTP();
  const message = generateForgotPasswordEmail(user, resetCode);

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Reset Your FindSafe Password",
    html: message,
  };

  try {
    // Delete any existing password reset requests for this user
    await PasswordReset.deleteMany({ userId: user._id });
    
    const salt = 10;
    const hashedResetCode = await bcrypt.hash(resetCode.toString(), salt);

    const newPasswordReset = new PasswordReset({
      userId: user._id,
      verificationCode: hashedResetCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 900000, // 15 minutes in milliseconds
    });

    await newPasswordReset.save();
    await transporter.sendMail(mailOptions);
    return { message: "Password reset code sent successfully", success: true };
  } catch (error) {
    console.error(error);
    return { message: "Error sending password reset code", success: false };
  }
};

/**
 * Verifies the email verification code for account verification
 * @param {string} verificationCode - The verification code entered by the user.
 * @param {string} email - The email address of the user.
 * @param {Object} res - The response object.
 */
const verifyEmail = async (verificationCode, email, res) => {
  try {
    const user = await Users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const userId = user._id;
    const passwordReset = await PasswordReset.findOne({ 
      userId: userId 
    });

    if (!passwordReset) {
      return res.status(404).json({ message: "Invalid verification code", success: false });
    }

    // Check if code has expired
    if (Date.now() > passwordReset.expiresAt) {
      await PasswordReset.findOneAndDelete({ _id: passwordReset._id });
      return res.status(400).json({ message: "Verification code has expired", success: false });
    }

    const validOtp = await bcrypt.compare(
      verificationCode,
      passwordReset.verificationCode
    );

    if (!validOtp) {
      return res.status(404).json({ message: "Invalid verification code", success: false });
    }


    user.verified = true;
    await user.save();

    await PasswordReset.findOneAndDelete({ _id: passwordReset._id });

    return res.status(200).json({ 
      message: "Account verification completed successfully", 
      success: true, 
      user: { id: user._id, name: user.name, email: user.email } 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", success: false });
  }
};

/**
 * Verifies the OTP for password reset
 * @param {string} email - The email address of the user.
 * @param {string} otp - The OTP entered by the user.
 * @returns {Object} Response with status and message.
 */
const verifyPasswordResetOTP = async (email, otp) => {
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return { message: "User not found", success: false };
    }

    const passwordReset = await PasswordReset.findOne({ userId: user._id });
    if (!passwordReset) {
      return { message: "Invalid or expired reset code", success: false };
    }

    // Check if code has expired
    if (Date.now() > passwordReset.expiresAt) {
      await PasswordReset.findOneAndDelete({ _id: passwordReset._id });
      return { message: "Reset code has expired", success: false };
    }

    const validOtp = await bcrypt.compare(otp, passwordReset.verificationCode);
    if (!validOtp) {
      return { message: "Invalid reset code", success: false };
    }

    // Generate a temporary token for password reset (valid for 10 minutes)
    const resetToken = generateOTP();
    const hashedResetToken = await bcrypt.hash(resetToken.toString(), 10);

    // Update the password reset record with the token
    passwordReset.verificationCode = hashedResetToken;
    passwordReset.expiresAt = Date.now() + 600000; // 10 minutes
    await passwordReset.save();

    return { 
      message: "OTP verified successfully", 
      success: true, 
      resetToken: resetToken,
      userId: user._id 
    };

  } catch (error) {
    console.error(error);
    return { message: "An error occurred", success: false };
  }
};

/**
 * Resets the user's password using the reset token
 * @param {string} email - The email address of the user.
 * @param {string} resetToken - The reset token.
 * @param {string} newPassword - The new password.
 * @returns {Object} Response with status and message.
 */
const resetPassword = async (email, resetToken, newPassword) => {
  try {
    const user = await Users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { message: "User not found", success: false };
    }

    const passwordReset = await PasswordReset.findOne({ userId: user._id });
    if (!passwordReset) {
      return { message: "Invalid or expired reset token", success: false };
    }

    // Check if token has expired
    if (Date.now() > passwordReset.expiresAt) {
      await PasswordReset.findOneAndDelete({ _id: passwordReset._id });
      return { message: "Reset token has expired", success: false };
    }

    const validToken = await bcrypt.compare(resetToken, passwordReset.verificationCode);
    if (!validToken) {
      return { message: "Invalid reset token", success: false };
    }

    // Hash and update the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

    // Clean up the password reset record
    await PasswordReset.findOneAndDelete({ _id: passwordReset._id });

    // Send confirmation email
    const confirmationMessage = generatePasswordResetSuccess(user);
    await sendEmail(user.email, 'Password Reset Successful - FindSafe', confirmationMessage);

    return { 
      message: "Password reset successfully", 
      success: true,
      user: { id: user._id, name: user.name, email: user.email }
    };

  } catch (error) {
    console.error(error);
    return { message: "An error occurred while resetting password", success: false };
  }
};

/**
 * Updates the user's password (legacy function - kept for compatibility).
 * @param {Object} user - The user object.
 * @param {string} newPassword - The new password.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with status and message.
 */
const updateUserPassword = async (user, newPassword, res) => {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    const message = generatePasswordResetConfirmation(user);
    await sendEmail(user.email, 'Password Reset Confirmation', message);

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "Password successfully updated",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating password" });
  }
};

/**
 * Sends an email to a specified recipient.
 * @param {string} recipient - The email address of the recipient.
 * @param {string} subject - The subject of the email.
 * @param {string} message - The HTML content of the email.
 * @returns {Object} JSON response with status and message.
 */
const sendEmail = async (recipient, subject, message) => {
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: recipient,
    subject: subject,
    html: message,
  };

  try {
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
    
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email has been sent successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error sending email" };
  }
};


/**
 * Sends an SMS message to user.
 * @param {string} sender - The name of the organization sending.
 * @param {string} message - The message content.
 * @param {string} recipientsPhone - The recipient's phone number.
 */
const sendSMS = async (sender, message, recipientsPhone) => {
  try {
    const data = {
      sender,
      message,
      recipients: [recipientsPhone],
    };

    const config = {
      method: "post",
      url: "https://sms.arkesel.com/api/v2/sms/send",
      headers: {
        "api-key": process.env.ARKESEL_API,
      },
      data,
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error("SMS API Error:", error.response.data);
      console.error("SMS API Status:", error.response.status);
    } else if (error.request) {
      console.error("SMS API Error:", error.request);
    } else {
      console.error("SMS API Error:", error.message);
    }
  }
};

module.exports = {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  verifyEmail,
  verifyPasswordResetOTP,
  resetPassword,
  updateUserPassword,
  sendEmail,
  sendSMS
};