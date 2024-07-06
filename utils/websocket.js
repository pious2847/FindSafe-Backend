const WebSocket = require("ws");

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  let clients = {};

  wss.on("connection", (ws, req) => {
    const deviceId = req.url.slice(1);
    clients[deviceId] = {
      ws: ws,
      connectedAt: new Date(),
      ip: req.socket.remoteAddress,
    };
    
    console.log(`Device ${deviceId} connected`);

    ws.on("message", async (message) => {
      const data = JSON.parse(message);
      console.log(`Received message from ${deviceId}:`, data);
      const connectionInfo = getConnectedDevices();
      console.log("Connected Devices:");
      connectionInfo.devices.forEach((device) => {
        console.log(
          `- Device ID: ${device.deviceId}, Connected At: ${device.connectedAt}, IP: ${device.ip}, Is Alive: ${device.isAlive}`
        );
      });

      if (data.command && data.deviceId) {
        console.log(`Sending command to ${data.deviceId}: ${data.command}`);
        try {
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
          console.log(`Command successfully sent to ${data.deviceId}`);
        } catch (error) {
          console.error(
            `Failed to send command to ${data.deviceId}: ${error.message}`
          );
          // Handle the error as needed
        }
      } else {
        console.log(`Invalid command or device ID: ${data}`);
      }
    });

    ws.on("close", () => {
      console.log(`Device ${deviceId} disconnected`);
      delete clients[deviceId];
    });
  });

  function getConnectedDevices() {
    const connectedDevices = Object.entries(clients).map(
      ([deviceId, client]) => ({
        deviceId,
        connectedAt: client.connectedAt,
        ip: client.ip,
        isAlive: client.ws.readyState === WebSocket.OPEN,
      })
    );

    return {
      devices: connectedDevices,
      count: connectedDevices.length,
    };
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

module.exports = {
  startWebSocketServer,
  sendCommandToDevice,
  getConnectedDevices,
};
