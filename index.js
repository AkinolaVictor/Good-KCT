const env = require('dotenv').config();
const express = require("express")
const app = express()
const helmet = require('helmet')
const path = require("path")
const morgan = require("morgan")
const webPush = require('web-push')
const cors = require("cors")
// const userAuth = require('./api/createAccount')
// const pushGen = webPush.generateVAPIDKeys()
// console.log(pushGen);
// routes
// const dbObj = require('./api/dbObj')
const bot = require('./api/botApi')
const bubble = require('./api/bubbleApi')
const user = require('./api/userApi')
const chats = require('./api/chatApi')
const http = require('http')
const socketio = require('socket.io');
const socketApi = require('./api/socketApi');
// const { connectWithMongoose} = require('./database/mongooseConncetion');
const { default: mongoose } = require('mongoose');
const watchAllStreams = require('./controllers/watches/watchAllStreams');
const copyAll = require('./controllers/copy/copyAll');
const { connectWithMongoose2 } = require('./database/mongooseConnection2');
const { read } = require('fs');
// const pushNotification = require('./api/pushNotificationApi')


// CONNECT TO DATABASE
// connectWithMongoose(copyAll)
// connectWithMongoose(()=>{})
// watchAllStreams()
mongoose.pluralize(null)
// copyAll()


const server = http.createServer(app)
const io = socketio(server, {
  // transports: ["polling", "websocket", "webtransport"],
  cors: {
    // origin: '*',
    origin: ["https://concealed.vercel.app", "https://concealed-dev.vercel.app", "http://localhost:3000"]
  }
})

io.on("connect", (socket)=>{
  // console.log(socket.id);
  socketApi(socket, io)
})


app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(cors());
app.options('*', cors());
var allowCrossDomain = function(req,res,next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();  
}
app.use(allowCrossDomain);
// app.use(cors())

// conditional based om env
app.use(morgan("dev")) //dev, tiny, ...

// app.use('/api', dbObj)

// app.use('/api/user', user)
// app.use('/api/bot', bot)
// app.use('/api/bubble', bubble)
// console.log(his);
let saved_connection_models = null
async function cachedConnection(){
  if(saved_connection_models){
    return saved_connection_models
  } else if(global.saved_connection_models){
    return global.saved_connection_models
  } else {
    const models = await connectWithMongoose2()
    if(models){
      saved_connection_models = models
      global.saved_connection_models = models
      watchAllStreams(models)
    }
    return models
  }
}
cachedConnection()
// app.use('/api/chats', chats)
// connectWithMongoose2((models)=>{
//   watchAllStreams(models)
// })
  
app.use('/api/user', async function(req, res, next){
  const models = await cachedConnection()
  if(models){
    req.dbModels = models
    next()
  } else {
    res.send({successful: false, message: "database failed to connect"})
  }
}, user)

app.use('/api/bot', async function(req, res, next){
  const models = await cachedConnection()
  if(models){
    req.dbModels = models
    next()
  } else {
    res.send({successful: false, message: "database failed to connect"})
  }
}, bot)

app.use('/api/bubble', async function(req, res, next){
  const models = await cachedConnection()
  if(models){
    req.dbModels = models
    next()
  } else {
    res.send({successful: false, message: "database failed to connect"})
  }
}, bubble)
  
app.use('/api/chats', async function(req, res, next){
  const models = await cachedConnection()
  if(models){
    req.dbModels = models
    next()
  } else {
    res.send({successful: false, message: "database failed to connect"})
  }
}, chats)

// connectWithMongoose2((models)=>{
//   watchAllStreams(models)
  
//   app.use('/api/user', function(req, res, next){
//     req.dbModels=models
//     next()
//   }, user)

//   app.use('/api/bot', function(req, res, next){
//     req.dbModels=models
//     next()
//   }, bot)

//   app.use('/api/bubble', function(req, res, next){
//     req.dbModels=models
//     next()
//   }, bubble)
  
//   app.use('/api/chats', function(req, res, next){
//     req.dbModels=models
//     next()
//   }, chats)
// })

app.use('/api/test', (req, res)=>{
    res.status(200).send('testing api')
})

app.use('/check', (req, res)=>{
    res.status(200).send('Server is working fine')
})
// const data = [1, 3, 4]
// console.log(typeof(data));
// console.log(typeof(JSON.stringify(data)));

// app.use(express.static(path.join(__dirname, "./public")))

// app.get("*", function(_, res){
//     res.sendFile(
//         path.join(__dirname, "./frontend/build/index.html"),
//         function(err){
//             if(err){
//                 res.status(500).send(err)
//             }
//         }
//     )
// })


// console.log(global)

const port = process.env.PORT || process.env.CONCEALED_MANUAL_PORT || 5001
server.listen(port, ()=>{ /* Do Nothing */})
// app.listen(port, ()=>{ /* Do Nothing */})
module.exports = app


// for vercel.json

// "outputDirectory": "frontend/build",