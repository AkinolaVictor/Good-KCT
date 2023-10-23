const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI
const dbname = process.env.DB_NAME
// const uri = "mongodb+srv://concealed:concealeddatabase@cluster0.5qf4q3t.mongodb.net/?retryWrites=true&w=majority"


// if (!process.env.MONGODB_URI) {
//     throw new Error('Add Mongo URI to .env.local')
// }

let client
let clientPromise

function connectToDB(){
    client = new MongoClient(uri)
    if (process.env.CONCEALED_ENV === 'local-development') {
        if (!global._mongoClientPromise) {
            global._mongoClientPromise = client.connect().then((mongo)=>{
                console.log("connected to mongodb");
                // mongo.db(dbname).collection("users").findOne({_id: "65252afecf0a9e47ac945a17"}).then((data)=>{
                // mongo.db(dbname).collection("users").findOne({name: "victor test"}).then((data)=>{
                //     console.log(data);
                // })
                return mongo
            }).catch((err)=>{
                console.log("error while connecting");
                return null
            })
        }
        clientPromise = global._mongoClientPromise
    } else {
        clientPromise = client.connect().then((mongo)=>{
            console.log("connected to db");
            return mongo
        }).catch((err)=>{
            console.log("error while connecting to mongodb");
            return null
        })
    }
}

function getDB(){
    if(!clientPromise){
        return null
    }

    return clientPromise.db(dbname)
}

module.exports = {
    connectToDB,
    mongodb: getDB()
}
