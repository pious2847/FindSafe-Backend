// Function to send command to a device
// module.exports.sendCommandToDevice = function sendCommandToDevice(deviceId, command) {
//     return new Promise((resolve, reject) => {
//         if (deviceConnections[deviceId]) {
//             deviceConnections[deviceId].send(JSON.stringify({ command }), (err) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve({ success: true });
//                 }
//             });
//         } else {
//             reject(new Error('Device not connected'));
//         }
//     });
//   };
  