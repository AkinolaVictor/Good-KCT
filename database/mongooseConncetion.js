// const { MongoClient } = require("mongodb");
const { default: mongoose } = require("mongoose");

// Discern production and dev
const uri = process.env.MONGODB_URI_DEV
// const uri = process.env.MONGODB_URI
const dbname = process.env.DB_NAME


// if (!process.env.MONGODB_URI) {
//     throw new Error('Add Mongo URI to .env.local')
// }

let clientPromise
let mongoClient = null
let cached = global.mongoose;

if(!cached) cached = global.mongoose = {conn: null, promise: null};

async function connectWithMongoosex(func){
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: dbname,
        // useFindAndModify: false, 
        // useCreateIndex: true, 
        // poolSize: 2, 
        // socketTimeoutMS: 10000,
    }
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
}

async function connectWithMongoose(func){
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: dbname,
    }
    if (process.env.CONCEALED_ENV === 'local-development') {
        if (!global._mongoClientPromise) {
            await mongoose.connect(uri, options).then((mongodb)=>{
                console.log("connected to db in local");
                global._mongoClientPromise = mongodb
                clientPromise = mongodb
                mongoClient = mongodb.connection.getClient
                func()
            }).catch(()=>{
                console.log("error encountered while trying to connect to db in local");
                global._mongoClientPromise = null
            })
        } else {
            console.log("already connected");
            clientPromise = global._mongoClientPromise
        }
    } else {
        if (!global._mongoClientPromise) {
            await mongoose.connect(uri, options).then((mongodb)=>{
                // console.log("connected to db in server");
                mongoClient = mongodb.connection.getClient
                clientPromise = mongodb
                global._mongoClientPromise = mongodb
            }).catch(()=>{
                console.log("error encountered while trying to connect to db in server");
                clientPromise = null
                global._mongoClientPromise = null
            })
        }
    }
}

function getDB(){

    if(!clientPromise){
        return null
    }

    return clientPromise
}

module.exports = {
    connectWithMongoose,
    mongoosedb: getDB,
    mongoClient: mongoClient
}
