// userShares

const { default: mongoose } = require("mongoose");

const userSharesSchema = mongoose.Schema({
    bubbles: [],
    userID: String,
    createdAt: {type: Date, default: new Date()},
    updatedAt: Date
}, { strict: false, minimize: false })

const userShares = mongoose.model("userShares", userSharesSchema)

module.exports = userShares