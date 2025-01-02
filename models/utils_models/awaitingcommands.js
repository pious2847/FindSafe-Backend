const mongoose = require('mongoose')

const pendingSchema = new mongoose.Schema({
    deviceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Devices',
    },
    command:{
        type: String,
        trim: true,
        required: true,
    },
    isexecuted:{
        type: Boolean,
        default: false,
    }
})

const PendingCommands =  mongoose.model('PendingCommands', pendingSchema)

module.exports = PendingCommands;
