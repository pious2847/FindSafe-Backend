import express from "express";
import bcrypt from 'bcrypt'
import User from "../models/users.js";

import { sendResetEmail } from '../utils/MailSender.js';


const router = express.Router();

router.get('/', (req, res)=>{
    res.send('Hello, world!')
})

router.post('/api/signup', async (req, res) => {
    try {
      const { username, email,  password } = req.body;
  
      // Check if user with the same name already exists
      const userExists = await User.findOne({ email });
  
      if (userExists) {
        return res.status(400).send('Username already exists');
      }

     const hashedPassword = await bcrypt.hash(password, 10);
     
      // Create a new user instance
      const user = new User({
       name: username,
       email: email,
       password: hashedPassword
      });
  
      // Save the new user to the database
      await user.save();

      const newuser = await User.findOne({ email })

      
      await sendResetEmail(email, user, req, res);
  
      res.status(200).send('Account created successfully,' + 'Verification Code Sent Successfully');

    } catch (error) {
      res.status(500).send('An error occurred: ' + error.message);
    }
});

router.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).send("Account doesn't exist");
      }
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(400).send('Invalid password');
      }
  
      // Set session variables
      req.session.userId = user._id;
      req.session.isLoggedIn = true;
      let userId = user._id
  
      res.status(200).send(userId);

    } catch (error) {
      res.status(500).send('An error occurred: ' + error.message);
    }
  });



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

export default router