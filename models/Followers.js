// feeds
const { default: mongoose } = require("mongoose");

const followersSchema = mongoose.Schema({
    userID: String,
    followers: {},
    createdAt: {type: Date, default: new Date()},
    updatedAt: Date
}, { strict: false, minimize: false })

const Followers = mongoose.model("followers", followersSchema)

module.exports = Followers