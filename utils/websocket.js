const WebSocket = require('ws');

function startWebSocketServer(port) {
  const wss = new WebSocket.Server({ port });

  let clients = {};

  wss.on('connection', (ws, req) => {
    const deviceId = req.url.slice(1);
    clients[deviceId] = ws;
    console.log(  `Device ${deviceId} connected`)


    ws.on('message', (message) => {
      const data = JSON.parse(message);
      console.log(`Received message from ${deviceId}:`, data);

      if (data.command && clients[data.deviceId]) {
        console.log(`Sending command to ${data.deviceId}: ${data.command}`);
        clients[data.deviceId].send(message);
      } else {
        console.log(`Invalid command or device ID: ${data}`);
      }
    });
    ws.on('close', () => {
      delete clients[deviceId];
    });
  });

  console.log(`WebSocket server is running on ws://https://find-safe-frontend.vercel.app/:${port}`);
}
function sendCommandToDevice(deviceId, command) {
  const device = deviceConnections.get(deviceId);
  
  console.log(`Received command from device ${command}`)
  if (device) {
    device.send(JSON.stringify({ command }));
    return true;
  }
  return false;
}

function getConnectedDevices() {
  return Array.from(deviceConnections.keys());
}


module.exports = { startWebSocketServer , sendCommandToDevice,
  getConnectedDevices};


