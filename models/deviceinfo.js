import { name } from "ejs";
import mongoose from "mongoose";

const DevicesInfo = new mongoose.Schema({
    devicename: {
        type: String,
        trim: true,
        require: true
    },
    modelNumber:{
     type: String,
     trim: true
    },
    curretlocation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },

    locationHistory:[{
     type : mongoose.Schema.Types.ObjectId,
     ref: 'Location'
    }

    ],
    image: {
      type: String,
      require: true
    }
})


const Devices = mongoose.model('devices', DevicesInfo);

export default Devices;
