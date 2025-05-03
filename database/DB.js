const mongoose = require('mongoose');


const ConnectDB =  ()=>{
  const atlasConnectionUri = process.env.MONGODB_URI;

    try {
     mongoose.connect( atlasConnectionUri);
          console.log("---- Database connection successfully ----");
          return mongoose.connection;
    } catch (error) {
        console.log("---- Erro in Database connection  ----", error);
    }
 }

module.exports = ConnectDB;
