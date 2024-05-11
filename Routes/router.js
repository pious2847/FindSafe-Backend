import express from 'express'
const router = express.Router()
import MobileDevice from '../models/utils_models/mobile.js'
import DevicesInfo from '../models/deviceinfo.js'
import Location from '../models/locations.js'
import User from '../models/users.js'


router.get('/api/mobiledevices', async (req, res) => {
    try {
      // Find all mobile devices
      const mobileDevices = await MobileDevice.find();
  
      res.status(200).json({ mobileDevices });

      console.log(mobileDevices);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred: ' + error.message });
    }
});

router.get('/api/mobiledevices/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      // Find all mobile devices
      console.log(userId);
      const mobileDevices = await DevicesInfo.find({ user: userId });
  
      console.log(mobileDevices);
      res.status(200).json({ mobileDevices });

    } catch (error) {
      res.status(500).json({ error: 'An error occurred: ' + error.message });
    }
});

router.post('/api/devicemode/:userId/:deviceId', async (req, res) => {
    const { userId, deviceId } = req.params;
    const { mode } = req.body;
    try {

      const user = await User.findOne({_id: userId})
      if(!user){
        return res.status(404).json({ message: "User not found" });
      }
      console.log(userId);

      const mobileDevices = await DevicesInfo.findOne({ _id: deviceId });
      console.log(mobileDevices);
  
      if (!mobileDevices) {
        return res.status(404).json({ message: "No devices found" });
      }
      mobileDevices.mode = mode;
      await mobileDevices.save(); // Use await since save() is an async operation
      
      if(mode === 'active'){
      return res.status(200).json({ message: "Active mode activated successfully" });
      }
      else{
        return res.status(200).json({ message: "Lost mode activated successfully" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'An error occurred: ' + error.message });
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
    
        res.status(200).json({ message: 'Device added successfully', device: newDevice });
      } catch (error) {
        res.status(500).json({ error: 'An error occurred: ' + error.message });
      }

})

router.post('/api/register-device/:userId/:devicename/:modelNumber', async (req, res) => {
try {
    const {userId,devicename, modelNumber} = req.params;

  let deviceimage = '';
  console.log('Error occured here' + userId);
  const user = await User.findById(userId);

  if(!user){
   return res.status(400).json({ error: 'User not Found, please login' });
  }

  const deviceExists = await DevicesInfo.findOne({devicename: devicename})
  
 const deciveimgurl = await MobileDevice.findOne({devicename: devicename});

  if (deciveimgurl){
    deviceimage = deciveimgurl.imageUrl
  }
  if (!deciveimgurl){
    deviceimage = 'https://static.vecteezy.com/system/resources/previews/002/249/888/large_2x/illustration-of-phone-screen-icon-free-vector.jpg'
  }

  const device = new DevicesInfo({
    user: userId,
    devicename: devicename,
    modelNumber: modelNumber,
    image: deviceimage
  })
  
  await device.save();

 user.Devices.push(device._id);

 user.save();

  res.status(200).json({ message: 'Location added successfully', deviceId: device._id });
  
} catch (error) {
  res.status(500).json({ error: 'An error occurred: ' + error.message });
}


})

router.post('/api/register-location/:deviceId/:locationId/:longitude/:latitude', async (req, res) =>{
 try {
   const {deviceId, locationId,latitude, longitude} = req.params;
 
 
  const deviceExists = await DevicesInfo.findOne({_id:deviceId})
 
  if (!deviceExists){
   return res.status(400).json({ error: 'Device not Found' });
  }
  
  const locationExists = await Location.findOne({_id:locationId})

  if (locationExists){
    locationExists.latitude = latitude;
    locationExists.longitude = longitude;

    locationExists.save();
  }
  const location =  new Location({
    latitude: parseFloat(latitude), // Convert latitude to float
    longitude: parseFloat(longitude) // Convert longitude to float
  });
  deviceExists.curretlocation = location._id
  deviceExists.locationHistory.push(location);

  await location.save();
  res.status(201).json({ message: 'Location added successfully', device: newDevice });c

 } catch (error) {
  res.status(500).json({ error: 'An error occurred: ' + error.message });
 }

})

export default router;