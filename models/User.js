const { default: mongoose } = require("mongoose");
// const { UserModel } = require("../database/mongooseConnection2");

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
// async function User(){
//     const data = await UserModel()
//     return data
// }


module.exports = User