const { doc, setDoc, getDoc, deleteDoc } = require('firebase/firestore');
const { default: mongoose } = require('mongoose');
const { database } = require('./firebase');

// let cached = global.mongoose;

// if(!cached) cached = global.mongoose = {conn: null, promise: null};
function connectionUri(){
    if(process.env.CONCEALED_ENV==='production'){
        // console.log("i used production in db");
        return process.env.MONGODB_URI_PROD
    } else {
        // console.log("i used development in db");
        return process.env.MONGODB_URI_DEV
    }
}
// const uri = process.env.MONGODB_URI_DEV
const dbname = process.env.DB_NAME
// console.log(`THIS IS THE MONGO URL ${connectionUri()}`);
// console.log("working");
// console.log("test");
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: dbname,
    // poolSize: 4, 
    // socketTimeoutMS: 10000,
    // maxPoolSize: 30,
    // socketTimeoutMS: 0
}

async function dbConnect(server){
    if(!global.mongooseConne){
        const thisConnection = await mongoose.connect(connectionUri(), {...options}).then(async (mongo) => {
            mongo.pluralize(null)
            if(server){
                const models = modelPack(mongo)
                server(models)
            }
            global.mongooseConne = mongo
            console.log('MONGODB CONNECTION SUCESSFUL');
            return modelPack(mongo)
        }).catch((err)=>{
            global.mongooseConne = null
            console.log(err, "MONGODB CONNECTION FAILED");
            return null
        });
        return thisConnection
    } else {
        if(server){
            const models = modelPack(global.mongooseConne)
            server(models)
        }
        return modelPack(global.mongooseConne)
    }
}

function modelPack(db){
    const models = {
        allUser: function(){
            const allUserSchema = db.Schema({
                users: {},
                name: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false})
            if(global.model_allUser){
                return global.model_allUser
            } else {
                const allUser = db.models.allusers || db.model("allusers", allUserSchema)
                global.model_allUser = allUser
                return allUser
            }
        }(),
        User: function(){
            // console.log(db);
            const userSchema = db.Schema({
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
            
            const User = db.models.users || db.model("users", userSchema)
            return User
        }(),
        bot: function(){
            const botsSchema = db.Schema({
                name: String,
                description: String,
                creatorID: String,
                tasks: [],
                data: [],
                id: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false})
            
            const bot = db.models.bots || db.model("bots", botsSchema)
            return bot
        }(),
        botActivities: function(){
            const botActivitiesSchema = db.Schema({
              userID: String,
              otherBotActivities: [],
              userBotActivities: [],
              createdAt: {type: Date, default: new Date()},
              updatedAt: Date
            }, {strict: false, minimize: false})
            
            const botActivities = db.models.botactivities || db.model("botactivities", botActivitiesSchema)
            return botActivities
        }(),
        bubble: function(){
            const bubbleSchema = db.Schema({
              user: {},
              type: String,
              createdDate: {},
              bubble: [],
              settings: {},
              reply:String,
              like:[],
              audience: [],
              totalImpressions: Number,
              aosID: Number,
              openedReplyCount: Number,
              followers: {},
              openedChartCount: Number,
              totalLikes: Number,
              openedReply: Number,
              activities: String,
              shareStructure: String,
              identity: Boolean,
              postID: String,
              version: Number,
              createdAt: {type: Date, default: new Date()},
              updatedAt: {
                  type: Date,
                  default: () => Date.now()
              }
            }, {strict: false, minimize: false})
              
            const bubble = db.models.bubbles || db.model("bubbles", bubbleSchema)
            return bubble
        }(),
        bubblesForEveryone: function(){
            const bubblesForEveryoneSchema = db.Schema({
                bubbleRefs: [],
                name: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false})
            
            const bubblesForEveryone = db.models.bubblesforeveryones || db.model("bubblesforeveryones", bubblesForEveryoneSchema)
            return bubblesForEveryone
        }(),
        chats: function(){
            const chatsSchema = db.Schema({
                chatID: String,
                messages: [],
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false})
            // mongoose.models = {}
            const chats = db.models.chats || db.model("chats", chatsSchema)
            return chats
        }(),
        Feeds: function(){
            const feedsSchema = db.Schema({
                bubbles: [],
                userID: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const Feeds = db.models["feeds"] || db.model("feeds", feedsSchema)
            return Feeds
        }(),
        Followers: function(){
            const followersSchema = db.Schema({
                userID: String,
                followers: {},
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const Followers = db.models["followers"] || db.model("followers", followersSchema)
            return Followers
        }(),
        Following: function(){
            const followingSchema = db.Schema({
                userID: String,
                following: {},
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const Following = db.models["followings"] || db.model("followings", followingSchema)
            return Following
        }(),
        LikeModel: function(){
            const userLikesSchema = db.Schema({
                bubbles: [],
                userID: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const LikeModel = db.models["userlikes"] || db.model("userlikes", userLikesSchema)
            return LikeModel
        }(),
        notifications: function(){
            const notificationsSchema = db.Schema({
                userID: String,
                all: [],
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const notifications = db.models["notifications"] || db.model("notifications", notificationsSchema)
            return notifications            
        }(),
        savedAudience: function(){
            const savedAudienceSchema = db.Schema({
                audience: {},
                userID: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const savedAudience = db.models["savedaudiences"] || db.model("savedaudiences", savedAudienceSchema)
            return savedAudience
        }(),
        savePush: function(){
            const savePushSchema = db.Schema({
                userID: String,
                subscription: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false})
            
            const savePush = db.models["savepushsubscribes"] || db.model("savepushsubscribes", savePushSchema)
            return savePush
        }(),
        usageAnalytics: function(){
            const usageAnalyticsSchema = db.Schema({
                userID: String,
                analytics: {},
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const usageAnalyticsModel = db.models["usageanalytics"] || db.model("usageanalytics", usageAnalyticsSchema)
            // const usageAnalyticsModel = db.models["newusageanalytics"] || db.model("newusageanalytics", usageAnalyticsSchema)
            return usageAnalyticsModel
        }(),
        usageAnalytics2: function(){
            const usageAnalyticsSchema = db.Schema({
                date: String,
                data: {},
                mau: {},
                totalUsers: Number,
                totalTime: Number,
                growthRate: String,
                retention: String,
                avgTime: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            // const usageAnalyticsModel = db.models["usageanalytics"] || db.model("usageanalytics", usageAnalyticsSchema)
            const usageAnalyticsModel = db.models["newusageanalytics"] || db.model("newusageanalytics", usageAnalyticsSchema)
            return usageAnalyticsModel
        }(),
        userBubbles: function(){
            const userBubblesSchema = db.Schema({
                bubbles: [],
                userID: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const userBubbles = db.models["userbubbles"] || db.model("userbubbles", userBubblesSchema)
            return userBubbles
        }(),
        userReplies: function(){
            const userRepliesSchema = db.Schema({
                bubbles: [],
                userID: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const userReplies = db.models["userreplies"] || db.model("userreplies", userRepliesSchema)
            return userReplies
        }(),
        userShares: function(){
            const userSharesSchema = db.Schema({
                bubbles: [],
                userID: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const userShares = db.models["usershares"] || db.model("usershares", userSharesSchema)
            return userShares
        }(),
        waitlist: function(){
            const waitlistSchema = db.Schema({
                name: String,
                email: String,
                where: String,
                purpose: String,
                createdAt: {type: Date, default: new Date()},
                // updatedAt: Date
            }, { strict: false, minimize: false })
            
            const waitlist = db.models["waitlist"] || db.model("waitlist", waitlistSchema)
            return waitlist
        }(),
        eachUserAnalytics: function(){
            const eachUserAnalyticsSchema = db.Schema({
                userID: String,
                date: {},
                bubbles: {},
                viewedHashs: {},
                profile: {},
                createdAt: {type: Date, default: new Date()},
            }, { strict: false, minimize: false })
            
            const eachUserAnalytics = db.models["eachUserAnalytics"] || db.model("eachUserAnalytics", eachUserAnalyticsSchema)
            return eachUserAnalytics
        }(),
        // userSettings: function(){
        //     const userSettingsSchema = db.Schema({
        //         userID: String,
        //         settings: {},
        //         createdAt: {type: Date, default: new Date()},
        //     }, { strict: false, minimize: false })
            
        //     const userSettings = db.models["userSettings"] || db.model("userSettings", userSettingsSchema)
        //     return userSettings
        // }(),
        hashTags: function(){
            const hashTagsSchema = db.Schema({
                title: String,
                allHashs: {},
                // lastDate: {},
                // count: {},
                createdAt: {type: Date, default: new Date()},
            }, { strict: false, minimize: false })
            
            const hashTags = db.models["hashTags"] || db.model("hashTags", hashTagsSchema)
            return hashTags
        }()
    }
    return {...models}
}

module.exports = {
    connectWithMongoose2: dbConnect,
}
