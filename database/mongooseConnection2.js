const { default: mongoose } = require('mongoose');

let cached = global.mongoose;

if(!cached) cached = global.mongoose = {conn: null, promise: null};
const uri = process.env.MONGODB_URI_DEV
const dbname = process.env.DB_NAME

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: dbname,
    // hffj
    // useFindAndModify: false, 
    // useCreateIndex: true, 
    // poolSize: 4, 
    // socketTimeoutMS: 10000,
}

async function dbConnect(server){
    // if(cached.conn) return cached.conn;
    if(!global.mongooseConne){
        global.mongooseConne = await mongoose.connect(uri, options).then((mongo) => {
            const models = modelPack(mongo)
            server(models)
            console.log('MONGODB CONNECTION SUCESSFUL');
            return mongo
        }).catch((err)=>{
            console.log(err, "MONGODB CONNECTION ERROR");
            return null
        });
    } else {
        const models = modelPack(global.mongooseConne)
        server(models)
    }
}

async function dbConnect2(server){
    if(cached.conn) return cached.conn;
    if(!cached.promise){
        cached.promise = await mongoose.connect(uri, options).then((mongoose) => {
            console.log('MONGODB CONNECTION SUCESSFUL');
            return mongoose;
        }).catch((error)=>{
            console.log(error, "MONGODB CONNECTION ERROR");
        });
    }
    cached.conn = await cached.promise;
    // cached.conn = cached.promise;
    return cached.conn;
}

const database = {
    connect: async function(){
        if(cached.conn) return cached.conn;
        if(!cached.promise){
            cached.promise = mongoose.connect(uri, options).then((mongoose) => {
                console.log('MONGODB CONNECTION SUCESSFUL');
                return mongoose;
            }).catch((error)=>{
                console.log(error, "MONGODB CONNECTION ERROR");
            });
        }
        cached.conn = await cached.promise;
        return cached.conn;
    },
    allUser: async function(){
        // const db = await this.connect()
        const db = await dbConnect()
        const allUserSchema = db.Schema({
            users: {},
            name: String,
            createdAt: {type: Date, default: new Date()},
            updatedAt: Date
        }, { strict: false, minimize: false})
        const allUser = db.model("allUsers", allUserSchema)
        return allUser
    },
    user: async function(){
        // const db = await this.connect()
        const db = await dbConnect()
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
        
        const User = db.model("users", userSchema)
        return User
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
                const allUser = db.models.allUsers || db.model("allUsers", allUserSchema)
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
            
            const bubblesForEveryone = db.models.bubblesForEveryone || db.model("bubblesForEveryone", bubblesForEveryoneSchema)
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
            
            const Following = db.models["following"] || db.model("following", followingSchema)
            return Following
        }(),
        LikeModel: function(){
            const userLikesSchema = db.Schema({
                bubbles: [],
                userID: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const LikeModel = db.models["userLikes"] || db.model("userLikes", userLikesSchema)
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
            
            const savedAudience = db.models["savedAudience"] || db.model("savedAudience", savedAudienceSchema)
            return savedAudience
        }(),
        savePush: function(){
            const savePushSchema = db.Schema({
                userID: String,
                subscription: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false})
            
            const savePush = db.models["savePushSubscribe"] || db.model("savePushSubscribe", savePushSchema)
            return savePush
        }(),
        usageAnalytics: function(){
            const usageAnalyticsSchema = db.Schema({
                userID: String,
                analytics: {},
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const usageAnalyticsModel = db.models["usageAnalytics"] || db.model("usageAnalytics", usageAnalyticsSchema)
            return usageAnalyticsModel
        }(),
        userBubbles: function(){
            const userBubblesSchema = db.Schema({
                bubbles: [],
                userID: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const userBubbles = db.models["userBubbles"] || db.model("userBubbles", userBubblesSchema)
            return userBubbles
        }(),
        userReplies: function(){
            const userRepliesSchema = db.Schema({
                bubbles: [],
                userID: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const userReplies = db.models["userReplies"] || db.model("userReplies", userRepliesSchema)
            return userReplies
        }(),
        userShares: function(){
            const userSharesSchema = db.Schema({
                bubbles: [],
                userID: String,
                createdAt: {type: Date, default: new Date()},
                updatedAt: Date
            }, { strict: false, minimize: false })
            
            const userShares = db.models["userShares"] || db.model("userShares", userSharesSchema)
            return userShares
        }()
    }
    return {...models}
}

module.exports = {
    connectWithMongoose2: dbConnect,
    allUserModel: database.allUser,
    UserModel: database.user
}
