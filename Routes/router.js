import express from 'express'
const router = express.Router()
import MobileDevice from '../models/utils_models/mobile.js'


router.get('/api/mobiledevices', async (req, res) => {
    try {
      // Find all mobile devices
      const mobileDevices = await MobileDevice.find();
  
      res.status(200).json({ mobileDevices });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred: ' + error.message });
    }
  });

router.post('/api/mobiledevices', async(req, res)=>{
    try {
        const { devicename, imageUrl } = req.body;
    
        // Check if the device already exists
        const existingDevice = await MobileDevice.findOne({ devicename });
    
        if (existingDevice) {
          return res.status(400).json({ error: 'Device already exists' });
        }
    
        // Create a new device entry
        const newDevice = new MobileDevice({
          devicename,
          imageUrl,
        });
    
        // Save the new device entry
        await newDevice.save();
    
        res.status(201).json({ message: 'Device added successfully', device: newDevice });
      } catch (error) {
        res.status(500).json({ error: 'An error occurred: ' + error.message });
      }

})

router.post('/register-device/', (req, res) => {
  const {devicename, devicenumber}= req.body





})

export default router;