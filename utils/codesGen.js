
const crypto = require('crypto');



module.exports.capitalizeEachWord = function capitalizeEachWord(str) {
    return str.replace(/\b\w/g, match => match.toUpperCase());
  }

 module.exports.generateSessionToken = function generateSessionToken(userId) {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now().toString();
    const data = `${userId}-${randomBytes}-${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Generate OTP for Verification Codes and Password Reset Codes.
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP
};

  // Generate JWT Token
const generateToken = (user) => {
    return jwt.sign({ user }, process.env.JWT_SECRET || 'Secret_Key', {
        expiresIn: '7d',
    });
};

module.exports.generateOTP = generateOTP;

module.exports.generateToken = generateToken;