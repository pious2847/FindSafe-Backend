const WebSocket = require('ws');

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  let clients = {};

  wss.on('connection', (ws, req) => {
    const deviceId = req.url.slice(1);
    clients[deviceId] = ws;
    console.log(`Device ${deviceId} connected`);

    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      console.log(`Received message from ${deviceId}:`, data);

      if (data.command && data.deviceId) {
        console.log(`Sending command to ${data.deviceId}: ${data.command}`);
       await clients[data.deviceId].send(message);
      } else {
        console.log(`Invalid command or device ID: ${data}`);
      }
    });

    ws.on('close', () => {
      console.log(`Device ${deviceId} disconnected`);
      delete clients[deviceId];
    });
  });

  console.log(`WebSocket server is running on ${server}`);
}

function sendCommandToDevice(deviceId, command) {
  const device = clients[deviceId];

  console.log(`Received command to send to device ${deviceId}: ${command}`);
  if (device) {
    device.send(JSON.stringify({ command }));
    return true;
  }
  return false;
}

function getConnectedDevices() {
  return Object.keys(clients);
}

module.exports = { startWebSocketServer, sendCommandToDevice, getConnectedDevices };
