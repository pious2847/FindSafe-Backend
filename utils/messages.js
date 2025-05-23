const generateAccountVerification = (user, verificationCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to FindSafe</title>
    <style>
        .verification-code {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        .content {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="header">
                <div class="logo">🔍 FindSafe</div>
                <h2 style="color: #2c3e50; margin: 0;">Verify Your Account</h2>
            </div>
            
            <p>Dear <strong>${user.name}</strong>,</p>
            
            <p>Welcome to FindSafe! We're excited to have you on board. To complete your account setup and ensure the security of your account, please verify your email address using the code below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <div class="verification-code">${verificationCode}</div>
            </div>

            <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #2c3e50;"><strong>⚠️ Important:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #2c3e50;">
                    <li>This verification code will expire in <strong>1 hour</strong></li>
                    <li>Enter this code exactly as shown (case-sensitive)</li>
                    <li>Do not share this code with anyone</li>
                </ul>
            </div>

            <p>Once verified, you'll be able to:</p>
            <ul style="padding-left: 20px;">
                <li>Add and manage your devices</li>
                <li>Track your belongings in real-time</li>
                <li>Set up emergency contacts</li>
                <li>Access all FindSafe features</li>
            </ul>
            
            <p>If you did not create an account with FindSafe, please disregard this email and contact our support team if you have any concerns.</p>
            
            <div class="footer">
                <p>Best regards,<br>The FindSafe Team</p>
                <p style="font-size: 12px; color: #999;">
                    This is an automated message, please do not reply to this email. 
                    If you need assistance, please contact our support team.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

const generateForgotPasswordEmail = (user, resetCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - FindSafe</title>
    <style>
        .reset-code {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        .content {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .alert {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="header">
                <div class="logo">🔍 FindSafe</div>
                <h2 style="color: #e74c3c; margin: 0;">🔐 Password Reset Request</h2>
            </div>
            
            <p>Dear <strong>${user.name}</strong>,</p>
            
            <p>We received a request to reset the password for your FindSafe account. If you made this request, please use the verification code below to proceed:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <div class="reset-code">${resetCode}</div>
            </div>

            <div class="alert">
                <p style="margin: 0;"><strong>⏰ Time Sensitive:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>This reset code expires in <strong>15 minutes</strong></li>
                    <li>Enter the code exactly as shown</li>
                    <li>Use this code only on the FindSafe password reset page</li>
                </ul>
            </div>

            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>🚨 Security Notice:</strong></p>
                <p style="margin: 10px 0 0 0;">If you did not request a password reset, please:</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Ignore this email</li>
                    <li>Ensure your account is secure</li>
                    <li>Contact our support team if you have concerns</li>
                </ul>
            </div>

            <p><strong>What happens next?</strong></p>
            <ol style="padding-left: 20px;">
                <li>Enter the verification code on the password reset page</li>
                <li>Create a new, secure password</li>
                <li>Log in with your new password</li>
            </ol>
            
            <div class="footer">
                <p>Best regards,<br>The FindSafe Security Team</p>
                <p style="font-size: 12px; color: #999;">
                    This is an automated security message. If you need immediate assistance, 
                    please contact our support team.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

const generatePasswordResetSuccess = (user) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful - FindSafe</title>
    <style>
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        .content {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .success-badge {
            background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
        }
        .security-tips {
            background-color: #e8f8f5;
            border-left: 4px solid #00b894;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="header">
                <div class="logo">🔍 FindSafe</div>
                <h2 style="color: #00b894; margin: 0;">✅ Password Reset Successful</h2>
            </div>
            
            <p>Dear <strong>${user.name}</strong>,</p>
            
            <p>Great news! Your FindSafe account password has been successfully reset and updated.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <div class="success-badge">🔐 Password Updated Successfully</div>
            </div>

            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>✅ Your account is now secure with your new password.</strong></p>
            </div>

            <div class="security-tips">
                <h3 style="margin-top: 0; color: #00b894;">🛡️ Security Recommendations</h3>
                <p>To keep your account secure, we recommend:</p>
                <ul style="padding-left: 20px;">
                    <li><strong>Sign out from all devices</strong> and sign back in with your new password</li>
                    <li><strong>Enable two-factor authentication</strong> for additional security</li>
                    <li><strong>Review your account activity</strong> for any suspicious actions</li>
                    <li><strong>Update your emergency contacts</strong> if needed</li>
                    <li><strong>Keep your password private</strong> and don't share it with anyone</li>
                </ul>
            </div>

            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>⚠️ Didn't reset your password?</strong></p>
                <p style="margin: 10px 0 0 0;">If you did not initiate this password reset, please contact our support team immediately. Your account security is our priority.</p>
            </div>

            <p>You can now log in to your FindSafe account using your new password and continue protecting your valuable items.</p>
            
            <div class="footer">
                <p>Best regards,<br>The FindSafe Security Team</p>
                <p style="font-size: 12px; color: #999;">
                    This is an automated security notification. If you have any questions or concerns, 
                    please don't hesitate to contact our support team.
                </p>
            </div>
        </div>
    </div>
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
    <style>
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        .content {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="header">
                <div class="logo">🔍 FindSafe</div>
                <h2 style="color: #28a745; margin: 0;">Password Reset Confirmation</h2>
            </div>
            
            <p>Dear <strong>${user.name}</strong>,</p>
            
            <p>This email confirms that your password for your FindSafe account has been successfully changed.</p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #28a745;">✓ Your password has been successfully updated</p>
            </div>

            <p>If you did not make this change, please contact our support team immediately or reset your password using the password reset option on our login page.</p>
            
            <p>For security reasons, we recommend:</p>
            <ul style="padding-left: 20px;">
                <li>Sign out of all other devices</li>
                <li>Enable two-factor authentication if you haven't already</li>
                <li>Review your recent account activity</li>
            </ul>

            <div class="footer">
                <p>Best regards,<br>The FindSafe Support Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">
                    This is an automated message, please do not reply to this email. If you need assistance, please contact our support team.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

const generateLostModeNotification = (user, device, activationCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device Lost Mode Activated - FindSafe</title>
    <style>
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        .content {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .activation-code {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 1px;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
        }
        .device-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
        }
        .alert-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            color: #856404;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="header">
                <div class="logo">🔍 FindSafe</div>
                <h2 style="color: #e74c3c; margin: 0;">🚨 Device Lost Mode Activated</h2>
            </div>

            <p>Dear <strong>${user.name}</strong>,</p>

            <p>Your device <strong>${device.devicename}</strong> has been successfully put into Lost Mode. We understand this can be a stressful situation, and we're here to help you recover your device.</p>

            <div class="device-info">
                <h3 style="margin-top: 0; color: #2c3e50;">📱 Device Details:</h3>
                <p><strong>Device Name:</strong> ${device.devicename}</p>
                <p><strong>Model Number:</strong> ${device.modelNumber}</p>
                <p><strong>Status:</strong> <span style="color: #e74c3c; font-weight: bold;">Lost Mode Active</span></p>
                <p style="margin-bottom: 0;"><strong>Activation Code:</strong></p>
                <div style="text-align: center; margin: 15px 0;">
                    <div class="activation-code">${activationCode}</div>
                </div>
            </div>

            <p><strong>🔍 What happens now?</strong></p>
            <ul style="padding-left: 20px;">
                <li><strong>Real-time tracking:</strong> Your device's location will be tracked and updated continuously</li>
                <li><strong>Instant notifications:</strong> You'll receive immediate alerts if your device is located</li>
                <li><strong>Secure reactivation:</strong> The activation code above will be required to reactivate your device</li>
                <li><strong>Emergency contacts:</strong> Your emergency contacts will be notified if configured</li>
            </ul>

            <div class="alert-box">
                <p style="margin: 0;"><strong>🔐 Important Security Information:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Keep this activation code safe and private</li>
                    <li>You'll need it to reactivate your device once found</li>
                    <li>Don't share this code with anyone except trusted individuals helping you</li>
                </ul>
            </div>

            <p><strong>💡 Tips for device recovery:</strong></p>
            <ul style="padding-left: 20px;">
                <li>Check the FindSafe app regularly for location updates</li>
                <li>Contact local authorities if you suspect theft</li>
                <li>Reach out to places you recently visited</li>
                <li>Ask friends and family to help look in common areas</li>
            </ul>

            <p>If you have any questions or need assistance during this process, please don't hesitate to contact our support team. We're here to help you every step of the way.</p>

            <div class="footer">
                <p>Best regards,<br>The FindSafe Support Team</p>
                <p style="font-size: 12px; color: #999;">
                    This is an automated alert. For immediate assistance, contact our 24/7 support team.
                </p>
            </div>
        </div>
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
    <style>
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        .content {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .success-badge {
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
        }
        .device-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #27ae60;
        }
        .security-reminder {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            color: #155724;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="header">
                <div class="logo">🔍 FindSafe</div>
                <h2 style="color: #27ae60; margin: 0;">🎉 Device Successfully Reactivated</h2>
            </div>

            <p>Dear <strong>${user.name}</strong>,</p>

            <p>Excellent news! Your device <strong>${device.devicename}</strong> has been successfully reactivated and is no longer in Lost Mode. We're thrilled that you've recovered your device!</p>

            <div style="text-align: center; margin: 30px 0;">
                <div class="success-badge">✅ Device Recovery Complete</div>
            </div>

            <div class="device-info">
                <h3 style="margin-top: 0; color: #2c3e50;">📱 Device Status Update:</h3>
                <p><strong>Device Name:</strong> ${device.devicename}</p>
                <p><strong>Model Number:</strong> ${device.modelNumber}</p>
                <p><strong>Current Status:</strong> <span style="background-color: #27ae60; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">🟢 Active & Secure</span></p>
                <p style="margin-bottom: 0;"><strong>Reactivated:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div class="security-reminder">
                <p style="margin: 0;"><strong>🛡️ Post-Recovery Security Checklist:</strong></p>
                <p style="margin: 10px 0 0 0;">We recommend completing these security steps to ensure your device remains protected:</p>
            </div>

            <p><strong>🔐 Recommended Security Actions:</strong></p>
            <ul style="padding-left: 20px;">
                <li><strong>Inspect your device:</strong> Check for any unauthorized changes or unfamiliar apps</li>
                <li><strong>Update credentials:</strong> Change your device's password, PIN, or biometric settings</li>
                <li><strong>Review location history:</strong> Check where your device has been during the lost period</li>
                <li><strong>Update emergency contacts:</strong> Ensure all contact information is current and accurate</li>
                <li><strong>Check app permissions:</strong> Review and update app access permissions</li>
                <li><strong>Run security scan:</strong> Perform a complete security check if available</li>
            </ul>

            <p><strong>📊 Next Steps:</strong></p>
            <ul style="padding-left: 20px;">
                <li>Your device tracking will continue as normal</li>
                <li>All FindSafe features are now fully active</li>
                <li>Consider reviewing your security settings in the app</li>
                <li>Update your device's backup and sync settings</li>
            </ul>

            <p>We're grateful that FindSafe could help reunite you with your device. Your trust in our service means everything to us, and we'll continue working hard to keep your belongings safe.</p>

            <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #2c3e50;"><strong>💡 Pro Tip:</strong> Consider enabling additional security features like automatic backups, remote wipe capabilities, and enhanced location tracking to better protect your device in the future.</p>
            </div>

            <div class="footer">
                <p>Congratulations on your successful device recovery!<br><strong>The FindSafe Team</strong></p>
                <p style="font-size: 12px; color: #999;">
                    Thank you for trusting FindSafe. If you have any feedback about your recovery experience, 
                    we'd love to hear from you.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`};

module.exports = {
  generateAccountVerification,
  generateForgotPasswordEmail,
  generatePasswordResetSuccess,
  generatePasswordResetConfirmation,
  generateLostModeNotification,
  generateDeviceFoundNotification
};