// default import
const express = require('express');
require('dotenv').config();
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const http = require('http');  // Add this line
const WebSocket = require('websocket');  // Add this line

const app = express();
const server = http.createServer(app);  // Add this line

// WebSocket server setup
const wss = new WebSocket.server({
    httpServer: server,
    autoAcceptConnections: false
});

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

// Use MongoStore as session store
const sessionConnectionUri = process.env.DBConnectionLink || 'mongodb+srv://abdulhafis2847:pious2847@findsafe.qgtvkt9.mongodb.net/';

app.use(session({
  secret: 'Secret_Key',
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: sessionConnectionUri
  })
}));

// Middleware to parse JSON bodies
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('tiny'));
app.use(cors());

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Configure Express to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, './public')));

// custom imports
require('./database/DB')();

//============================== Configure EJS as the view engine===================//
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const userRouter = require('./Routes/user');
const router = require('./Routes/router');

// measuring the speed of site load
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} took ${duration}ms timestamp ${new Date()}`);
  });
  next();
});

// settings for using routes
app.use(userRouter);
app.use(router);

// ===============Handling UncaughtExceptions ======================//

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log(err);
  console.log("UNHANDLED EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

startServer();

// Function to handle server and database connections
async function startServer() {
  const PORT = process.env.PORT || 8080;
 
  try {
    // Start the HTTP server (which also starts the WebSocket server)
    server.listen(PORT, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`----Server running on http://localhost:${PORT} ----`);
      }
    });
      
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); // Exit the application with an error code
  }
}

// ===============Handling UnhandledRejection======================//

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log(err);
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  server.close(() => {
      process.exit(1);
  });
});

// Export the sendCommandToDevice function if you need to use it in other files
module.exports = { sendCommandToDevice };
