// feeds
const { default: mongoose } = require("mongoose");

const allUserSchema = mongoose.Schema({
    users: {},
    name: String,
    createdAt: {type: Date, default: new Date()},
    updatedAt: Date
}, { strict: false, minimize: false})

const allUser = mongoose.model("allUsers", allUserSchema)

module.exports = allUser