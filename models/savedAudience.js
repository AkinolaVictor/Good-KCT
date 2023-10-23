// savedAudience
const { default: mongoose } = require("mongoose");

const savedAudienceSchema = mongoose.Schema({
    audience: {},
    userID: String,
    createdAt: {type: Date, default: new Date()},
    updatedAt: Date
}, { strict: false, minimize: false })

const savedAudience = mongoose.model("savedAudience", savedAudienceSchema)

module.exports = savedAudience