const generateAccountVerification= (user, verificationCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to FindSafe</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Verify Your FindSafe Account</h2>
      <p>Dear ${user.name},</p>
      
      <p>Thank you for registering with FindSafe. To complete your account setup, please verify your email address by clicking the link below:</p>
      
        <p style="color: #555; font-size: 16px;"><b>Verification Code:</b> <span style="style="
          background-color: #3498db;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
        ">${verificationCode}</span></p>


      <p>This verification code will expire in 24 hours.</p>
      
      <p>If you did not create an account, please disregard this email.</p>
      
      <p>Best regards,<br>FindSafe Support Team</p>
</body>
</html>
  `;
};

const generatePasswordResetConfirmation = (user) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Confirmation - FindSafe</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Password Reset Confirmation</h2>
    <p>Dear ${user.name},</p>
    
    <p>This email confirms that your password for your FindSafe account has been successfully changed.</p>
    
    <div style="
      background-color: #f8f9fa;
      border-left: 4px solid #28a745;
      padding: 15px;
      margin: 20px 0;
    ">
      <p style="margin: 0; color: #28a745;">✓ Your password has been successfully updated</p>
    </div>

    <p>If you did not make this change, please contact our support team immediately or reset your password using the password reset option on our login page.</p>
    
    <p>For security reasons, we recommend:</p>
    <ul style="padding-left: 20px;">
      <li>Sign out of all other devices</li>
      <li>Enable two-factor authentication if you haven't already</li>
      <li>Review your recent account activity</li>
    </ul>

    <p>Best regards,<br>FindSafe Support Team</p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      This is an automated message, please do not reply to this email. If you need assistance, please contact our support team.
    </p>
</body>
</html>
  `;
};

const generateLostModeNotification = (user, device,) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device Lost Mode Activated - FindSafe</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #e74c3c;">Device Lost Mode Activated</h2>
    </div>

    <p>Dear ${user.name},</p>

    <p>Your device <strong>${device.devicename}</strong> has been successfully put into Lost Mode. We understand this can be a stressful situation, and we're here to help.</p>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2c3e50;">Device Details:</h3>
        <p><strong>Device Name:</strong> ${device.devicename}</p>
        <p><strong>Model Number:</strong> ${device.modelNumber}</p>
    </div>

    <p><strong>What happens now?</strong></p>
    <ul style="padding-left: 20px;">
        <li>Your device's location will be tracked and updated in real-time</li>
        <li>You'll receive immediate notifications if your device is located</li>
        <li>The activation code above will be required to reactivate your device</li>
    </ul>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Important:</strong> Keep this activation code safe. You'll need it to reactivate your device once found.</p>
    </div>

    <p>If you have any questions or need assistance, please contact our support team immediately.</p>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p>Best regards,<br>FindSafe Support Team</p>
    </div>
</body>
</html>
`};
const generateDeviceFoundNotification = (user, device) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device Reactivated - FindSafe</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #27ae60;">Device Successfully Reactivated</h2>
    </div>

    <p>Dear ${user.name},</p>

    <p>Great news! Your device <strong>${device.devicename}</strong> has been successfully reactivated and is no longer in Lost Mode.</p>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2c3e50;">Device Details:</h3>
        <p><strong>Device Name:</strong> ${device.devicename}</p>
        <p><strong>Model Number:</strong> ${device.modelNumber}</p>
        <p><strong>Current Status:</strong> <span style="background-color: #27ae60; color: white; padding: 5px 10px; border-radius: 3px;">Active</span></p>
    </div>

    <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Security Reminder:</strong> We recommend reviewing your device's security settings and updating them if necessary.</p>
    </div>

    <p>Additional Security Recommendations:</p>
    <ul style="padding-left: 20px;">
        <li>Check your device for any unauthorized changes</li>
        <li>Update your device's password or PIN</li>
        <li>Review recent location history</li>
        <li>Ensure all your emergency contact information is up to date</li>
    </ul>

    <p>Thank you for trusting FindSafe. We're glad we could help you recover your device.</p>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p>Best regards,<br>FindSafe Support Team</p>
    </div>
</body>
</html>
`};

module.exports = {
  generateAccountVerification,
  generatePasswordResetConfirmation,
  generateLostModeNotification,
  generateDeviceFoundNotification
};