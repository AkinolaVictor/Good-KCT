const { default: mongoose } = require("mongoose");

const userSchema = mongoose.Schema({
    id: String,
    userInfo: {},
    audience: {},
    followers: {},
    following: {},
    profile: {},
    profilePhotoUrl: String,
    coverPhotoUrl: String,
    // posts: {},
    // feed: [],
    chats: [],
    bots:[],
    likes: [],
    replies: [],
    shares: [],
    // bubbles: [],
    createdAt: {
        type: Date, 
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: () => Date.now()
    }
}, { strict: false, minimize: false})

const User = mongoose.model("users", userSchema)

module.exports = User