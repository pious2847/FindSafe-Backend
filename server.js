// default import
import express from 'express';
import { config } from 'dotenv';
import  morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import MongoStore from 'connect-mongo'
import cors from 'cors';




// custom imports
import ConnectDB from './database/DB.js'
import userRouter from './Routes/user.js'
import router from './Routes/router.js';

const app = express();

// dotenv
config();

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

      // Start the Express server
      app.listen(PORT,  () => {
        console.log(`---- Server is running on  ${process.env.PORT } ----`);
      });
      
    } catch (err) {
      console.error("Database connection error:", err);
      process.exit(1); // Exit the application with an error code
    }
  }
  
  startServer();
  