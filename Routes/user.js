const express = require('express');
const userController = require('../controller/user');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('home');
});

// Get user profile
router.get('/api/get-user/:UserId', userController.getUser);

// User Registration
router.post('/api/signup', userController.signup);

// User Login
router.post('/api/login', userController.login);

// Verify Account Email
router.post('/api/verify-otp', userController.verifyAccount);

// Resend Account Verification
router.post('/api/resend-verification', userController.resendVerificationEmail);

// Forgot Password - Send OTP
router.post('/api/forgot-password', userController.forgotPassword);

// Verify Password Reset OTP
router.post('/api/verify-reset-otp', userController.verifyResetOTP);

// Reset Password
router.post('/api/reset-password', userController.resetPassword);

// Update user profile
router.put('/api/update/:userId', userController.updateUser);

// Upload profile picture
router.post('/api/upload-profile-picture/:userId', upload.single('profilePicture'), userController.uploadProfilePicture);

// Delete profile picture
router.delete('/api/delete-profile-picture/:userId', userController.deleteProfilePicture);

// Change password
router.post('/api/change-password/:userId', userController.changePassword);

// Logout
router.post('/api/logout', userController.logout);



module.exports = router;