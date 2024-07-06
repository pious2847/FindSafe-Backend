const WebSocket = require('ws');

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  let clients = {};

  wss.on('connection', (ws, req) => {
    const deviceId = req.url.slice(1);
    clients[deviceId] = {
      ws: ws,
      connectedAt: new Date(),
      ip: req.socket.remoteAddress
    };
    console.log(`Device ${deviceId} connected`);

    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      console.log(`Received message from ${deviceId}:`, data);
      const totalestablishedcon =  getConnectedDevices();
      console.log(`Total Established Connections ${JSON.parse(totalestablishedcon)}`);

      if (data.command && data.deviceId) {
        console.log(`Sending command to ${data.deviceId}: ${data.command}`);
        try {
           ws.send(message);
          console.log(`Command successfully sent to ${data.deviceId}`);
        } catch (error) {
          console.error(`Failed to send command to ${data.deviceId}: ${error.message}`);
          // Handle the error as needed
        }
      } else {
        console.log(`Invalid command or device ID: ${data}`);
      }
    });
    

    ws.on('close', () => {
      console.log(`Device ${deviceId} disconnected`);
      delete clients[deviceId];
    });
  });

  function getConnectedDevices() {
    return Object.entries(clients).map(([deviceId, client]) => ({
      deviceId,
      connectedAt: client.connectedAt,
      ip: client.ip,
      isAlive: client.ws.readyState === WebSocket.OPEN
    }));
  }

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
