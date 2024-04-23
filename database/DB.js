import mongoose from 'mongoose';

const ConnectDB =  ()=>{
    try {
     mongoose.connect(process.env.DBConnectionLink, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          console.log("---- Database connection successfully ----");
    } catch (error) {
        console.log("---- Erro in Database connection  ----", error);
    }
 }

 export default ConnectDB;
