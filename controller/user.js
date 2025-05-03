const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../utils/cloudinary');

const userController = {
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

      res.status(200).json({ message: '', User: user });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: `An error occurred: ${error.message}` });
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
