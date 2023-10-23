const { default: mongoose } = require('mongoose');

let cached = global.mongoose;

if(!cached) cached = global.mongoose = {conn: null, promise: null};
const uri = process.env.MONGODB_URI_DEV
const dbname = process.env.DB_NAME

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: dbname,
    // useFindAndModify: false, 
    // useCreateIndex: true, 
    // poolSize: 2, 
    // socketTimeoutMS: 10000,
}

async function dbConnect(){
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

module.exports = {
    connectWithMongoose2: dbConnect,
    allUserModel: database.allUser,
    UserModel: database.user
}
