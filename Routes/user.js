import express from "express";
import bcrypt from 'bcrypt'
import User from "../models/users.js";



const router = express.Router();

router.get('/', (req, res)=>{
    res.send('Hello, world!')
})

router.post('/api/signup', async (req, res) => {
    try {
      const { name,phone,email,  password } = req.body;
  
      // Check if user with the same name already exists
      const userExists = await User.findOne({ name });
  
      if (userExists) {
        return res.status(400).send('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

     
      // Create a new user instance
      const user = new User({
       name: name,
       phone: phone,
       email: email,
       password: hashedPassword
      });
  
      // Save the new user to the database
      await user.save();
  
      res.status(201).send('Account created successfully');
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
  
      res.status(200).send('Login successful');
    } catch (error) {
      res.status(500).send('An error occurred: ' + error.message);
    }
  });

export default router