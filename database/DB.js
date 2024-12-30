const mongoose = require('mongoose');


const ConnectDB =  ()=>{
  const atlasConnectionUri = process.env.DBConnectionLink || 'mongodb+srv://abdulhafis2847:pious2847@findsafe.qgtvkt9.mongodb.net/'

    try {
     mongoose.connect( atlasConnectionUri);
          console.log("---- Database connection successfully ----");
          return mongoose.connection;
    } catch (error) {
        console.log("---- Erro in Database connection  ----", error);
    }
 }

module.exports = ConnectDB;
