const mongoose = require("mongoose");

const DevicesInfo = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    devicename: {
        type: String,
        trim: true,
        require: true
    },
    mode:{
        type: String,
        trim: true,
        default: 'active',
    },
    activationCode:{
        type: String,
        trim: true,
        default: ' ',
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

module.exports = Devices;
