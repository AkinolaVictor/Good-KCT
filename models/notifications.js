// feeds
const { default: mongoose } = require("mongoose");

const notificationsSchema = mongoose.Schema({
    userID: String,
    all: [],
    createdAt: {type: Date, default: new Date()},
    updatedAt: Date
}, { strict: false, minimize: false })

const notifications = mongoose.model("notifications", notificationsSchema)

module.exports = notifications