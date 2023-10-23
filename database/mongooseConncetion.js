const { MongoClient } = require("mongodb");
const { default: mongoose } = require("mongoose");

const uri = process.env.MONGODB_URI_DEV
// const uri = process.env.MONGODB_URI
const dbname = process.env.DB_NAME


// if (!process.env.MONGODB_URI) {
//     throw new Error('Add Mongo URI to .env.local')
// }

let clientPromise
let mongoClient = null

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
                func()
            }).catch(()=>{
                console.log("error encountered while trying to connect to db in local");
                global._mongoClientPromise = null
            })
        } else {
            console.log("already connected");
        }
        clientPromise = global._mongoClientPromise
    } else {
        await mongoose.connect(uri, options).then((mongodb)=>{
            // console.log("connected to db in server");
            mongoClient = mongodb.connection.getClient
            clientPromise = mongodb
        }).catch(()=>{
            console.log("error encountered while trying to connect to db in server");
            clientPromise = null
        })
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
