const express = require("express");
const bcrypt  = require('bcrypt')
const User  = require("../models/users");
const jwt = require('jsonwebtoken');
const userController = require('../controller/user');
const { upload } = require('../utils/cloudinary');

const { sendResetEmail, sendSMS } =  require('../utils/MailSender');
const {generateSessionToken} = require('../utils/codesGen')

const router = express.Router();

router.get('/', (req, res)=>{
    res.render('home')
})

// Get user profile
router.get('/api/get-user/:UserId', userController.getUser);

router.post('/api/signup', async (req, res) => {
    try {
      const { username, email,  password } = req.body;

      // Check if user with the same name already exists
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).send({message: 'Account already exists'});
      }

     const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user instance
      const user = new User({
       name: username,
       email: email,
       password: hashedPassword
      });
  // send verified codes for user
      await sendResetEmail(email, user, req, res);

        // Save the new user to the database
      await user.save();
      res.status(200).send({message: 'Account created successfully, Verification Code Sent Successfully'});

    } catch (error) {
      res.status(500).send({message: `An error occurred : ${error.message}`});

    }
});


  router.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).send({message: "Invalid Email and Password"});
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).send({message : 'Invalid password Entered'});
      }

      // Generate a session token (you can use a library like jsonwebtoken for this)
      const sessionToken = generateSessionToken(user._id);
      const token =  await generateToken(user)

      // Set session variables
      req.session.userId = user._id;
      req.session.isLoggedIn = true;
      req.session.token = sessionToken;

      res.status(200).send({
        success: true,
        message: 'User logged in successfully',
        userId: user._id,
        sessionToken: sessionToken,
        token: token
      });

    } catch (error) {
      console.log(error);
      res.status(500).send({message: `An error occurred : ${error.message}`});
    }
  });

// Update user profile
router.put('/api/update/:userId', userController.updateUser);

// Upload profile picture
router.post('/api/upload-profile-picture/:userId', upload.single('profilePicture'), userController.uploadProfilePicture);

// Delete profile picture
router.delete('/api/delete-profile-picture/:userId', userController.deleteProfilePicture);

// Change password
router.post('/api/change-password/:userId', userController.changePassword);


router.post('/api/authenticate-account/:userId', async(req, res)=>{
try {
    const {userId} = req.params;
    const authCode = req.body;

   const user = User.findById({_id: userId});

   if(!user){
    return res.status(400).send("Account doesn't exist");
   }

   await sendResetEmail(email, user, req, res);

} catch (error) {

}
})

const generateToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: '7d',
  })}
module.exports = router