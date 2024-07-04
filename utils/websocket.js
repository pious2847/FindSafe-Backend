const WebSocket = require('ws');

function startWebSocketServer(port) {
  const wss = new WebSocket.Server({ port });

  let clients = {};

  wss.on('connection', (ws, req) => {
    const deviceId = req.url.slice(1);
    clients[deviceId] = ws;
    console.log(  `Device ${deviceId} connected`)

    ws.on('message', (message) => {
      console.log( `${message}`)
      const data = JSON.parse(message);
      if (data.command && clients[data.deviceId]) {
        clients[data.deviceId].send(message);
      }
    });

    ws.on('close', () => {
      delete clients[deviceId];
    });
  });

  console.log(`WebSocket server is running on ws://https://find-safe-frontend.vercel.app/:${port}`);
}

module.exports = { startWebSocketServer };
