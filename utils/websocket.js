// websocket.js

const WebSocket = require('ws');

let wss;
const deviceConnections = new Map();

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const deviceId = req.url.slice(1); // Remove the leading '/'
    deviceConnections.set(deviceId, ws);

    console.log(`Device ${deviceId} connected`);

    ws.on('close', () => {
      deviceConnections.delete(deviceId);
      console.log(`Device ${deviceId} disconnected`);
    });

    ws.on('message', (message) => {
      console.log(`Received message from device ${deviceId}: ${message}`);
      // Handle incoming messages if needed
    });
  });
}

function sendCommandToDevice(deviceId, command) {
  const device = deviceConnections.get(deviceId);
  
  console.log(`Received command from device ${device}`)
  if (device) {
    device.send(JSON.stringify({ command }));
    return true;
  }
  return false;
}

function getConnectedDevices() {
  return Array.from(deviceConnections.keys());
}

module.exports = {
  setupWebSocket,
  sendCommandToDevice,
  getConnectedDevices
};