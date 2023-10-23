// bubblesForEveryone
const { default: mongoose } = require("mongoose");

const bubblesForEveryoneSchema = mongoose.Schema({
    bubbleRefs: [],
    name: String,
    createdAt: {type: Date, default: new Date()},
    updatedAt: Date
}, { strict: false, minimize: false})

const bubblesForEveryone = mongoose.model("bubblesForEveryone", bubblesForEveryoneSchema)

module.exports = bubblesForEveryone