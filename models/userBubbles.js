// feeds
const { default: mongoose } = require("mongoose");

const userBubblesSchema = mongoose.Schema({
    bubbles: [],
    userID: String,
    createdAt: {type: Date, default: new Date()},
    updatedAt: Date
}, { strict: false, minimize: false })

const userBubbles = mongoose.model("userBubbles", userBubblesSchema)

module.exports = userBubbles