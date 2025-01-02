const WebSocket = require("ws");

let clients = {};
let wss;
let messageHandlers = new Set();

function startWebSocketServer(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    const deviceId = req.url.slice(1);

    // Validate deviceId
    if (!deviceId) {
      console.log("Connection attempt without deviceId");
      ws.close();
      return;
    }

    clients[deviceId] = {
      ws,
      connectedAt: new Date(),
      ip: req.socket.remoteAddress
    };

    console.log(`Device ${deviceId} connected from ${req.socket.remoteAddress}`);

    // Setup ping-pong to detect stale connections
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        console.log(`Received from ${deviceId}:`, data);

        // Notify all registered handlers about the message
        messageHandlers.forEach(handler => {
          handler(deviceId, data);
        });

        // If message contains command info, forward it
        if (data.deviceId && data.command) {
          sendCommandToDevice(message);
        }
      } catch (error) {
        console.error(`Error processing message from ${deviceId}:`, error);
      }
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for device ${deviceId}:`, error);
    });

    ws.on("close", () => {
      console.log(`Device ${deviceId} disconnected`);
      delete clients[deviceId];
    });
  });

  // Setup interval to check for stale connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log("WebSocket server started");
}

function sendCommandToDevice(message) {
  try {
    const data = JSON.parse(message);

    if (!data.deviceId || !data.command) {
      console.error("Invalid deviceId or command");
      return false;
    }

    const client = clients[data.deviceId];
    if (!client || !client.ws || client.ws.readyState !== WebSocket.OPEN) {
      console.log(`Device ${data.deviceId} not connected or not ready`);
      return false;
    }
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    console.log(`Sent command to device ${data.deviceId}: ${command}`);
    return true;
  } catch (error) {
    console.error(`Error sending command to device:`, error);
    return false;
  }
}

function getConnectedDevices() {
  return {
    devices: Object.entries(clients).map(([deviceId, client]) => ({
      deviceId,
      connectedAt: client.connectedAt,
      ip: client.ip,
      isAlive: client.ws.readyState === WebSocket.OPEN,
    })),
    count: Object.keys(clients).length,
  };
}

function onMessage(handler) {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

module.exports = {
  startWebSocketServer,
  sendCommandToDevice,
  getConnectedDevices,
  onMessage
};