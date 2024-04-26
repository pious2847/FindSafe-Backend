import express from 'express'
const router = express.Router()
import MobileDevice from '../models/utils_models/mobile.js'
import DevicesInfo from '../models/deviceinfo.js'
import Location from '../models/locations.js'


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
  res.status(201).json({ message: 'Location added successfully', device: newDevice });

 } catch (error) {
  res.status(500).json({ error: 'An error occurred: ' + error.message });
 }

})

export default router;