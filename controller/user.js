const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../utils/cloudinary');
const { sendVerificationEmail, sendForgotPasswordEmail, verifyEmail, verifyPasswordResetOTP, resetPassword } = require('../utils/MailSender');
const { generateSessionToken } = require('../utils/codesGen');
const ActivityLogger = require('../utils/activityLogger');

const generateToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_SECRET || 'Secret_Key', {
    expiresIn: '7d',
  });
};

const userController = {

  /**
   * Signup
   */
  async signup(req, res) {
    try {
      const { username, email, password } = req.body;

      // Input validation
      if (!username || !email || !password) {
        return res.status(400).json({
          message: 'Username, email, and password are required',
          success: false
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Please provide a valid email address',
          success: false
        });
      }

      // Password strength validation
      if (password.length < 6) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters long',
          success: false
        });
      }


      // Check if user with the same email already exists
      const userExists = await User.findOne({ email: email.toLowerCase() });

      if (userExists) {
        return res.status(400).json({ message: 'Account with this email already exists', success: false });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user instance
      const user = new User({
        name: username,
        email: email.toLowerCase(),
        password: hashedPassword,
        verified: false
      });
      // Save the new user to the database
      await user.save();

      // remove user password before sending user data 
      delete user._doc.password;
      delete user._doc.__v;


      // Send verification email
      const emailResult = await sendVerificationEmail(
        user.email,
        user,
        'Verify Your FindSafe Account',
        res,
        'Account created successfully. Verification code sent to your email.'
      );

      if (emailResult.success) {
        res.status(200).json({
          message: 'Account created successfully. Verification code sent to your email.',
          success: true,
          userId: user._id
        });
      } else {
        res.status(500).json({
          message: 'Account created but failed to send verification email. Please try again.',
          success: false
        });
      }


    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        message: `An error occurred: ${error.message}`,
        success: false
      });

    }
  },
  /**
   * Login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          message: 'Email and password are required',
          success: false
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(400).send({ message: "Invalid Email and Password" });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).send({ message: 'Invalid password Entered' });
      }

      // remove user password before sending user data 
      delete user.password;
      delete user._doc.password;
      delete user._doc.__v;

      // Generate a session token (you can use a library like jsonwebtoken for this)
      const sessionToken = generateSessionToken(user._id);
      const token = generateToken(user)

      // Set session variables
      req.session.userId = user._id;
      req.session.isLoggedIn = true;
      req.session.token = sessionToken;

      // Log user login activity
      const clientIP = req.ip || req.connection.remoteAddress || 'Unknown';
      await ActivityLogger.logUserLogin(user._id, user.email, clientIP);

      res.status(200).send({
        success: true,
        message: 'User logged in successfully',
        userId: user._id,
        sessionToken: sessionToken,
        token: token
      });

    } catch (error) {
      console.log(error);
      res.status(500).send({ message: `An error occurred : ${error.message}` });
    }
  },

  /**
   * Verify Account
   */
  async verifyAccount(req, res) {
    try {
      const { otp, email } = req.body;

      if (!otp || !email) {
        return res.status(400).json({
          message: 'Verification code is required',
          success: false
        });
      }

      await verifyEmail(otp, email, res);

    } catch (error) {
      console.error('Account verification error:', error);
      res.status(500).json({
        message: 'An error occurred during verification',
        success: false
      });
    }
  },


  /**
   * Get user profile
   */
  async getUser(req, res) {
    try {
      const userId = req.params.UserId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // remove user password before sending user data 
      delete user.password;
      delete user._doc.password;
      delete user._doc.__v;

      res.status(200).json({ message: '', User: user });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
  },

  /**
   * Forget Password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: 'Email is required',
          success: false
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Please provide a valid email address',
          success: false
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Don't reveal whether the email exists or not for security
        return res.status(200).json({
          message: 'If an account with that email exists, a password reset code has been sent.',
          success: true
        });
      }

      const result = await sendForgotPasswordEmail(user.email, user);

      if (result.success) {
        res.status(200).json({
          message: 'Password reset code sent to your email.',
          success: true
        });
      } else {
        res.status(500).json({
          message: 'Failed to send password reset code. Please try again.',
          success: false
        });
      }

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        message: 'An error occurred while processing your request',
        success: false
      });
    }
  },

  /**
   * Resend Verification Email
   */
  async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({
          message: "Account not found",
          success: false
        });
      }

      if (user.verified) {
        return res.status(400).json({
          message: "Account is already verified",
          success: false
        });
      }

      const emailResult = await sendVerificationEmail(
        user.email,
        user,
        'Verify Your FindSafe Account - Resend',
        res,
        'New verification code sent to your email.'
      );

      if (emailResult.success) {
        res.status(200).json({
          message: 'New verification code sent to your email.',
          success: true
        });
      } else {
        res.status(500).json({
          message: 'Failed to send verification email. Please try again.',
          success: false
        });
      }

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        message: 'An error occurred while resending verification',
        success: false
      });
    }
  },

  /**
   * Verify Reset OTP
   */
  async verifyResetOTP(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          message: 'Email and OTP are required',
          success: false
        });
      }

      const result = await verifyPasswordResetOTP(email, otp);

      if (result.success) {
        res.status(200).json({
          message: result.message,
          success: true,
          resetToken: result.resetToken,
          userId: result.userId
        });
      } else {
        res.status(400).json({
          message: result.message,
          success: false
        });
      }

    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({
        message: 'An error occurred during OTP verification',
        success: false
      });
    }
  },
  /**
   * Reset Password
   */
  async resetPassword(req, res) {
    try {
      const { email, resetToken, newPassword } = req.body;

      if (!email || !resetToken || !newPassword) {
        return res.status(400).json({
          message: 'User ID, reset token, and new password are required',
          success: false
        });
      }

      // Password strength validation
      if (newPassword.length < 6) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters long',
          success: false
        });
      }

      const result = await resetPassword(email, resetToken, newPassword);

      if (result.success) {
        res.status(200).json({
          message: result.message,
          success: true,
          user: result.user
        });
      } else {
        res.status(400).json({
          message: result.message,
          success: false
        });
      }

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        message: 'An error occurred while resetting password',
        success: false
      });
    }
  },

  /**
   * Logout User
   */
  async logout(req, res) {
    try {
      const userId = req.session.userId;

      req.session.destroy(async (err) => {
        if (err) {
          return res.status(500).json({
            message: 'Could not log out, please try again',
            success: false
          });
        }

        // Log user logout activity if we have userId
        if (userId) {
          try {
            const user = await User.findById(userId);
            if (user) {
              await ActivityLogger.logUserLogout(userId, user.email);
            }
          } catch (logError) {
            console.error('Error logging logout activity:', logError);
          }
        }

        res.clearCookie('connect.sid'); // Clear session cookie
        res.status(200).json({
          message: 'Logged out successfully',
          success: true
        });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        message: 'An error occurred during logout',
        success: false
      });
    }
  },


  /**
   * Update user profile
   */
  async updateUser(req, res) {
    try {
      const userId = req.params.userId;

      const updateFields = {};

      // Only include fields present in the request body
      if (req.body.username) updateFields.name = req.body.username;
      if (req.body.phone) updateFields.phone = req.body.phone;

      // Handle address info
      if (req.body.addressinfo) {
        if (req.body.addressinfo.area) updateFields['addressinfo.area'] = req.body.addressinfo.area;
        if (req.body.addressinfo.houseNo) updateFields['addressinfo.houseNo'] = req.body.addressinfo.houseNo;
      }

      // Handle emergency contact
      if (req.body.emergencycontact) {
        if (req.body.emergencycontact.name) updateFields['emergencycontact.name'] = req.body.emergencycontact.name;
        if (req.body.emergencycontact.contact) updateFields['emergencycontact.contact'] = req.body.emergencycontact.contact;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const token = jwt.sign({ user }, process.env.JWT_SECRET || 'Secret_Key', {
        expiresIn: '7d',
      });

      // Log profile update activity
      await ActivityLogger.logProfileUpdated(userId, user.email, Object.keys(updateFields));

      res.status(200).json({
        message: 'User updated successfully',
        user,
        token,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Server error', message: error.message });
    }
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(req, res) {
    try {
      const userId = req.params.userId;

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Find the user
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete old profile picture from Cloudinary if it exists
      if (user.profilePictureId && user.profilePictureId !== '') {
        try {
          await cloudinary.uploader.destroy(user.profilePictureId);
          console.log(`Deleted old profile picture: ${user.profilePictureId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting old profile picture from Cloudinary:', cloudinaryError);
          // Continue with the upload even if deletion fails
        }
      }

      // Get the Cloudinary result from the middleware
      const result = req.file;

      // Update user profile picture
      user.profilePicture = result.path;
      user.profilePictureId = result.filename;
      await user.save();

      res.status(200).json({
        message: 'Profile picture uploaded successfully',
        profilePicture: result.path,
        profilePictureId: result.filename,
        user
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
  },

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(req, res) {
    try {
      const userId = req.params.userId;

      // Find the user
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete profile picture from Cloudinary if it exists
      if (user.profilePictureId && user.profilePictureId !== '') {
        try {
          await cloudinary.uploader.destroy(user.profilePictureId);
          console.log(`Deleted profile picture: ${user.profilePictureId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting profile picture from Cloudinary:', cloudinaryError);
          // Continue with the update even if deletion fails
        }
      }

      // Update user profile picture
      user.profilePicture = '';
      user.profilePictureId = '';
      await user.save();

      res.status(200).json({
        message: 'Profile picture deleted successfully',
        user
      });
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
  },

  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      const userId = req.params.userId;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      // Find the user
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
  }
};

module.exports = userController;
