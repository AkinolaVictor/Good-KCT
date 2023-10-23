// feeds
const { default: mongoose } = require("mongoose");

const savePushSchema = mongoose.Schema({
    userID: String,
    subscription: String,
    createdAt: {type: Date, default: new Date()},
    updatedAt: Date
}, { strict: false, minimize: false})

const savePush = mongoose.model("savePushSubscribe", savePushSchema)

module.exports = savePush