// default import
const express = require('express');
 require('dotenv').config();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo');
const cors = require('cors');

// custom imports
const ConnectDB = require('./database/DB');
const userRouter = require('./Routes/user');
const router = require('./Routes/router');


const app = express();

// dotenv
dotenv.config();


const sessionConnectionUri = process.env.DBConnectionLink || 'mongodb+srv://abdulhafis2847:pious2847@findsafe.qgtvkt9.mongodb.net/'

// Use MongoStore as session store
app.use(session({
  secret: 'Secret_Key',
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: sessionConnectionUri
  })
}));


// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(morgan('tiny'))
app.use(cors())


// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




// settings for using routes
app.use(userRouter)
app.use(router)



// Function to handle server and database connections
async function startServer() {
  const PORT  = process.env.PORT || 8080;
    try {
    //  connection established and connected to database
         ConnectDB();
        console.log(process.env.IP);
      // Start the Express server
      app.listen(PORT,  (error) => {
        if (error) {
          console.log(error)
      }
      else {
          console.log(`----Server running on  http://localhost:${PORT} ----`)
      }
      });
      
    } catch (err) {
      console.error("Database connection error:", err);
      process.exit(1); // Exit the application with an error code
    }
  }
  
  startServer();
  