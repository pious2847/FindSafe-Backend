const WebSocket = require("ws");

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  const clients = {}; // Keep track of connected clients

  wss.on("connection", (ws, req) => {
    const deviceId = req.url.slice(1); // Extract device ID from URL
    clients[deviceId] = {
      ws,
      connectedAt: new Date(),
      ip: req.socket.remoteAddress,
    };

    console.log(`Device ${deviceId} connected`);

    // Listen for messages from the client
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        console.log(`Received message from ${deviceId}:`, data);

        if (data.command && data.deviceId) {
          sendCommandToDevice(data.deviceId, data.command);
        } else {
          console.log(`Invalid message format: ${message}`);
        }
      } catch (error) {
        console.error(`Error processing message: ${error.message}`);
      }
    });

    // Handle client disconnection
    ws.on("close", () => {
      console.log(`Device ${deviceId} disconnected`);
      delete clients[deviceId];
    });

    // Handle WebSocket errors
    ws.on("error", (error) => {
      console.error(`WebSocket error with device ${deviceId}: ${error.message}`);
    });
  });

  // Function to send a command to a specific device
  function sendCommandToDevice(deviceId, command) {
    const client = clients[deviceId];
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ command }));
      console.log(`Command "${command}" sent to device ${deviceId}`);
    } else {
      console.warn(
        `Cannot send command to ${deviceId}: Client not connected or WebSocket not open`
      );
    }
  }

  // Function to get a list of connected devices
  function getConnectedDevices() {
    return Object.keys(clients).map((deviceId) => ({
      deviceId,
      connectedAt: clients[deviceId].connectedAt,
      ip: clients[deviceId].ip,
      isAlive: clients[deviceId].ws.readyState === WebSocket.OPEN,
    }));
  }

  console.log("WebSocket server is running");

  return {
    sendCommandToDevice,
    getConnectedDevices,
  };
}

module.exports = { startWebSocketServer };
