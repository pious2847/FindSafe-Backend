const WebSocket = require("ws");

let clients = {};

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    const deviceId = req.url.slice(1);
    clients[deviceId] = { ws, connectedAt: new Date() };

    console.log(`Device ${deviceId} connected`);

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      console.log(`Received from ${deviceId}:`, data);
    });

    ws.on("close", () => {
      console.log(`Device ${deviceId} disconnected`);
      delete clients[deviceId];
    });
  });

  console.log("WebSocket server started");
}

function sendCommandToDevice(deviceId, command) {
  if (clients[deviceId] && clients[deviceId].ws.readyState === WebSocket.OPEN) {
    clients[deviceId].ws.send(JSON.stringify({ command }));
    return true;
  }
  return false;
}

function getConnectedDevices() {
  return Object.keys(clients).map((deviceId) => ({
    deviceId,
    connectedAt: clients[deviceId].connectedAt,
    isAlive: clients[deviceId].ws.readyState === WebSocket.OPEN,
  }));
}

module.exports = { startWebSocketServer, sendCommandToDevice, getConnectedDevices };
