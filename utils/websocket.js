// websocket.js
const WebSocket = require('websocket');

let deviceConnections = {};

const sendCommandToDevice = (deviceId, command) => {
    return new Promise((resolve, reject) => {
        if (deviceConnections[deviceId]) {
            deviceConnections[deviceId].sendUTF(JSON.stringify({ command }));
            resolve({ success: true });
        } else {
            reject(new Error('Device not connected'));
        }
    });
};

function setupWebSocket(server) {
    const wss = new WebSocket.server({
        httpServer: server,
        autoAcceptConnections: false
    });

    wss.on('request', (request) => {
        const connection = request.accept(null, request.origin);
        const deviceId = request.resourceURL.pathname.replace('/', '');
        
        deviceConnections[deviceId] = connection;
        console.log(`Device ${deviceId} connected`);

        connection.on('close', () => {
            delete deviceConnections[deviceId];
            console.log(`Device ${deviceId} disconnected`);
        });

        connection.on('message', (message) => {
            if (message.type === 'utf8') {
                console.log(`Received message from device ${deviceId}: ${message.utf8Data}`);
            }
        });
    });
}

module.exports = { setupWebSocket, sendCommandToDevice };