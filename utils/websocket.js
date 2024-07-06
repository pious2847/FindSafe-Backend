const WebSocket = require('ws');

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  let clients = new Map();

  wss.on('connection', (ws, req) => {
    const deviceId = req.url.slice(1);
    clients.set(deviceId, ws);
    console.log(`Device ${deviceId} connected`);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        console.log(`Received message from ${deviceId}:`, data);
      
        if (data.command && data.deviceId) {
          console.log(`Sending command to ${data.deviceId}: ${data.command}`);
          sendCommandToDevice(data.deviceId, data.command);
          sendCommandToAllDevices(data.command)
        } else {
          console.log(`Invalid command or device ID: ${JSON.stringify(data)}`);
        }
      } catch (error) {
        console.error(`Error processing message: ${error.message}`);
      }
    });

    ws.on('close', () => {
      console.log(`Device ${deviceId} disconnected`);
      clients.delete(deviceId);
    });
  });

  console.log(`WebSocket server is running on ${server}`);
}

function sendCommandToDevice(deviceId, command) {
  console.log(`Attempting to send command to device ${deviceId}: ${command}`);
  const device = clients.get(deviceId);

  if (device && device.readyState === WebSocket.OPEN) {
    device.send(JSON.stringify({ command }));
    console.log(`Command successfully sent to ${deviceId}`);
    return true;
  } else {
    console.log(`Device ${deviceId} not found or not connected`);
    return false;
  }
}

function sendCommandToAllDevices(command) {
  console.log(`Sending command to all devices: ${command}`);
  clients.forEach((ws, deviceId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ command }));
      console.log(`Command sent to device ${deviceId}`);
    } else {
      console.log(`Device ${deviceId} is not connected, skipping`);
    }
  });
}

function getConnectedDevices() {
  return Array.from(clients.keys());
}

module.exports = { startWebSocketServer, sendCommandToDevice, sendCommandToAllDevices, getConnectedDevices };