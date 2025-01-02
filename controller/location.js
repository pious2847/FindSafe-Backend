const PendingCommands = require("../models/utils_models/awaitingcommands");
const { sendCommandToDevice } = require("../utils/websocket");
const DevicesInfo = require("../models/deviceinfo");
const Location = require("../models/locations");


const locationController = {
    async registerDeviceLocation(req, res){
        try {
            const { deviceId } = req.params;
            const { latitude, longitude } = req.body;
            // console.log(req.body);
        
            const device = await DevicesInfo.findById(deviceId);
            if (!device) {
              return res.status(404).json({ error: "Device not found" });
            }
        
            // Create a new location document
            const newLocation = new Location({
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            });
            await newLocation.save();
        
            // Update the device's current location and push the new location to the history
            if (device.curretlocation) {
              // If currentLocation is not null, push it to the locationHistory
              device.locationHistory.push(device.curretlocation);
            }
            device.curretlocation = newLocation._id;
            device.locationHistory.push(newLocation._id);
            await device.save();
        
            res.status(201).json({ message: "Location added successfully" });
          } catch (error) {
            res.status(500).json({ message: "An error occurred: " + error.message });
          }
    },
    async getdeviceLocations(req, res){
        const deviceId = req.params.deviceId;
  
        try {
          const device = await DevicesInfo.findById(deviceId).populate(
            "locationHistory"
          );
      
          if (!device) {
            return res.status(404).json({ error: "Device not found" });
          }
      
          const locationHistory = await Location.find({
            _id: { $in: device.locationHistory },
          }).sort({ timestamp: -1 });
      
          res.status(200).json(locationHistory);
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to fetch location history" });
        }
    },
   async updateDeviceCurrentLocation(req, res){
        try {
            const { deviceId, latitude, longitude } = req.body;
        
            // Find the device by its ID
            const device = await DevicesInfo.findById(deviceId);
        
            if (!device) {
              return res.status(404).json({ error: "Device not found" });
            }
        
            // Create a new location document
            const newLocation = new Location({ latitude, longitude });
            await newLocation.save();
        
            // Update the device's current location and push the previous location to the history
            device.curretlocation = newLocation._id;
            const  currentlochiscount = device.locationHistory.length;
        
            if( currentlochiscount >= 30){
             device.locationHistory.shift();
            }
            device.locationHistory.push(device.curretlocation);
            await device.save();

            const anypendingCommand = await PendingCommands.findOne({deviceId: device._id});
            if(anypendingCommand){
                sendCommandToDevice(deviceId, anypendingCommand.command)
            }
            await PendingCommands.findOneAndDelete({_id: anypendingCommand._id});

            res.status(200).json({ message: "Location updated successfully" });
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
          }
    }
}

module.exports = locationController