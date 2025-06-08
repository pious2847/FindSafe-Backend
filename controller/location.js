const PendingCommands = require("../models/utils_models/awaitingcommands");
const { sendCommandToDevice } = require("../utils/websocket");
const DevicesInfo = require("../models/deviceinfo");
const Location = require("../models/locations");
const { checkDeviceGeofences, calculateDistance } = require("./geofence");
const Geofence = require("../models/geofence");
const GeofenceHistory = require("../models/geofence_history");
const notificationService = require("../utils/notification_service");
const ActivityLogger = require('../utils/activityLogger');


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

            // Log location update activity
            await ActivityLogger.logLocationUpdate(
                device.user,
                deviceId,
                device.devicename,
                { latitude, longitude, timestamp: newLocation.timestamp }
            );

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

            // Push the current location to history before updating (if it exists)
            if (device.curretlocation) {
              const currentlochiscount = device.locationHistory.length;

              if (currentlochiscount >= 30) {
                device.locationHistory.shift();
              }
              device.locationHistory.push(device.curretlocation);
            }

            // Update the device's current location
            device.curretlocation = newLocation._id;
            await device.save();

            // Log location update activity
            await ActivityLogger.logLocationUpdate(
                device.user,
                deviceId,
                device.devicename,
                { latitude, longitude, timestamp: newLocation.timestamp }
            );

            const anypendingCommand = await PendingCommands.findOne({deviceId: device._id});
            if(anypendingCommand){
              sendCommandToDevice({deviceId:`${deviceId}`, command:anypendingCommand.command});

              // Log command execution activity
              await ActivityLogger.logCommandExecuted(
                device.user,
                deviceId,
                device.devicename,
                anypendingCommand.command
              );

              await PendingCommands.findOneAndDelete({_id: anypendingCommand._id});
            }

            // Check if device is within any geofences
            try {
              // Get previously triggered geofences for this device
              const previouslyTriggeredGeofences = global.triggeredGeofences?.[deviceId] || [];

              // Check current geofences
              const triggeredGeofences = await checkDeviceGeofences(deviceId, latitude, longitude);

              // Store current triggered geofences
              if (!global.triggeredGeofences) {
                global.triggeredGeofences = {};
              }
              global.triggeredGeofences[deviceId] = triggeredGeofences.map(g => g._id.toString());

              if (triggeredGeofences.length > 0) {
                // Notify the device about triggered geofences
                sendCommandToDevice({
                  deviceId: `${deviceId}`,
                  command: 'geofence_alert',
                  data: { geofences: triggeredGeofences }
                });

                // Check for new entries (geofences that weren't triggered before)
                for (const geofence of triggeredGeofences) {
                  if (!previouslyTriggeredGeofences.includes(geofence._id.toString())) {
                    console.log(`Device ${deviceId} entered geofence ${geofence.name}`);

                    // Get device info for notification
                    const deviceInfo = await DevicesInfo.findById(deviceId).populate('user');
                    if (deviceInfo && deviceInfo.user) {
                      // Calculate distance from geofence center
                      const distance = calculateDistance(
                        latitude,
                        longitude,
                        geofence.center.latitude,
                        geofence.center.longitude
                      );

                      // Log geofence entry in history
                      const historyEntry = new GeofenceHistory({
                        userId: deviceInfo.user._id,
                        deviceId: deviceId,
                        geofenceId: geofence._id,
                        eventType: 'entered',
                        location: { latitude, longitude },
                        distance: distance,
                        timestamp: new Date()
                      });
                      await historyEntry.save();

                      // Log geofence entry activity
                      await ActivityLogger.logGeofenceEvent(
                        deviceInfo.user._id,
                        deviceId,
                        deviceInfo.devicename,
                        geofence.name,
                        'entered'
                      );

                      // Send push notification for geofence entry
                      await notificationService.sendGeofenceNotification(
                        deviceInfo.user._id,
                        geofence,
                        deviceInfo.devicename,
                        true // isEntry
                      );
                    }
                  }
                }

                // Check for exits (geofences that were triggered before but aren't now)
                const currentGeofenceIds = triggeredGeofences.map(g => g._id.toString());
                for (const previousGeofenceId of previouslyTriggeredGeofences) {
                  if (!currentGeofenceIds.includes(previousGeofenceId)) {
                    console.log(`Device ${deviceId} exited geofence ${previousGeofenceId}`);

                    // Get geofence info
                    const geofence = await Geofence.findById(previousGeofenceId);
                    if (geofence) {
                      // Get device info for notification
                      const deviceInfo = await DevicesInfo.findById(deviceId).populate('user');
                      if (deviceInfo && deviceInfo.user) {
                        // Calculate distance from geofence center
                        const distance = calculateDistance(
                          latitude,
                          longitude,
                          geofence.center.latitude,
                          geofence.center.longitude
                        );

                        // Calculate dwell time
                        const entryRecord = await GeofenceHistory.findOne({
                          userId: deviceInfo.user._id,
                          deviceId: deviceId,
                          geofenceId: geofence._id,
                          eventType: 'entered'
                        }).sort({ timestamp: -1 });

                        const dwellTime = entryRecord ?
                          new Date().getTime() - entryRecord.timestamp.getTime() : 0;

                        // Log geofence exit in history
                        const historyExit = new GeofenceHistory({
                          userId: deviceInfo.user._id,
                          deviceId: deviceId,
                          geofenceId: geofence._id,
                          eventType: 'exited',
                          location: { latitude, longitude },
                          distance: distance,
                          dwellTime: dwellTime,
                          timestamp: new Date()
                        });
                        await historyExit.save();

                        // Log geofence exit activity
                        await ActivityLogger.logGeofenceEvent(
                          deviceInfo.user._id,
                          deviceId,
                          deviceInfo.devicename,
                          geofence.name,
                          'exited'
                        );

                        // Send push notification for geofence exit
                        await notificationService.sendGeofenceNotification(
                          deviceInfo.user._id,
                          geofence,
                          deviceInfo.devicename,
                          false // isEntry
                        );
                      }
                    }
                  }
                }
              }
            } catch (geofenceError) {
              console.error("Error checking geofences:", geofenceError);
              // Continue with response even if geofence check fails
            }

            res.status(200).json({ message: "Location updated successfully" });
          } catch (error) {
            console.error(error);
            console.log(error);
            res.status(500).json({ error: "Internal server error" });
          }
    }
}



module.exports = locationController