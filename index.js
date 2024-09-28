const env = require('dotenv').config();
const express = require("express")
const app = express()
const helmet = require('helmet')
const path = require("path")
const morgan = require("morgan")
const webPush = require('web-push')
const cors = require("cors")
const multer = require("multer")
// const userAuth = require('./api/createAccount')
// const pushGen = webPush.generateVAPIDKeys()
// console.log(pushGen);
// routes
// const dbObj = require('./api/dbObj')
const bot = require('./api/botApi')
const bubble = require('./api/bubbleApi')
const user = require('./api/userApi')
const cinema = require('./api/cinemaApi')
const uploadData = require('./controllers/uploads/uploadData')
const chats = require('./api/chatApi')
const http = require('http')
const socketio = require('socket.io');
const socketApi = require('./api/socketApi');
// const { connectWithMongoose} = require('./database/mongooseConncetion');
const { default: mongoose } = require('mongoose');
const watchAllStreams = require('./controllers/watches/watchAllStreams');
// const copyAll = require('./controllers/copy/copyAll');
const { connectWithMongoose2 } = require('./database/mongooseConnection2');
// const analytics_playground = require('./controllers/tools/analytics/analytics_playground');
// const majorToolsAndFixes = require('./controllers/tools/majorToolAndFixes');
// const allMessageUser = require('./controllers/tools/messageUser/allMessageUser');
// const fs = require('fs');

// const pushNotification = require('./api/pushNotificationApi')

// CONNECT TO DATABASE

// let saved_connection_models = null
// async function cachedConnection(cb){
//   if(saved_connection_models){
//     return saved_connection_models
//   } else if(global.saved_connection_models){
//     return global.saved_connection_models
//   } else {
//     const models = await connectWithMongoose2()
//     if(models){
//       saved_connection_models = models
//       global.saved_connection_models = models
//       watchAllStreams(models)
//       if(cb){
//         cb(models)
//       }
//     }
//     return models
//   }
// }
// // cachedConnection(analytics_playground)
// // cachedConnection(allMessageUser)
// // cachedConnection(majorToolsAndFixes)
// cachedConnection()

mongoose.pluralize(null)
// copyAll()


const server = http.createServer(app)
const io = socketio(server, {
  // transports: ["polling", "websocket", "webtransport"],
  cors: {
    origin: '*',
    // origin: ["https://concealed.vercel.app", "https://concealed-dev.vercel.app", "http://localhost:3000"]
  },
  maxHttpBufferSize: 1e8
})

// io.on("connect", (socket)=>{
//   console.log("connected", socket.id);
//   socketApi({}, socket, io)
// })


let saved_connection_models = null
// let watching = null
async function cachedConnection(cb){
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
      io.on("connect", (socket)=>{
        console.log("connected", socket.id);
        if(!global.actively_watching){
          socketApi(models, socket, io)
        }
        global.actively_watching = true
      })

      if(cb){
        cb(models)
      }
    }
    return models
  }
}
// cachedConnection(analytics_playground)
// cachedConnection(allMessageUser)
// cachedConnection(majorToolsAndFixes)
cachedConnection()


const storage = multer.diskStorage({
  destination: function (req, file, cb){
    // return cb(null, "public/images/")
    return cb(null, "uploads/")
  },
  filename: function (req, file, cb){
      const {fieldname, mimetype} = file

      function ext(){
        const mim = mimetype.split("/")
        if(mim[1]){
          return `.${mim[1]}`
        }

        return ""
      }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null, `${fieldname}-${uniqueSuffix}${ext()}`)
  }
})
  

// const upload = multer({dest: "uploads/"})
const upload = multer({storage})


app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(cors());
app.options('*', cors());
var allowCrossDomain = function(req,res,next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  // res.header('Access-Control-Allow-Headers', 'Content-Type');
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
// app.use('/api/chats', chats)

app.post("/api/upload", upload.single("over_server"), uploadData)
  
app.use('/api/user', async function(req, res, next){
  const models = await cachedConnection()
  if(models){
    req.dbModels =  {...models, io}
    next()
  } else {
    res.send({successful: false, message: "database failed to connect"})
  }
}, user)
  
app.use('/api/cinema', async function(req, res, next){
  const models = await cachedConnection()
  if(models){
    req.dbModels =  {...models, io}
    next()
  } else {
    res.send({successful: false, message: "database failed to connect"})
  }
}, cinema)

app.use('/api/bot', async function(req, res, next){
  const models = await cachedConnection()
  if(models){
    req.dbModels =  {...models, io}
    next()
  } else {
    res.send({successful: false, message: "database failed to connect"})
  }
}, bot)

app.use('/api/bubble', async function(req, res, next){
  const models = await cachedConnection()
  if(models){
    req.dbModels = {...models, io}
    next()
  } else {
    res.send({successful: false, message: "database failed to connect"})
  }
}, bubble)
  
app.use('/api/chats', async function(req, res, next){
  const models = await cachedConnection()
  if(models){
    req.dbModels =  {...models, io}
    next()
  } else {
    res.send({successful: false, message: "database failed to connect"})
  }
}, chats)

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
const port = process.env.PORT || process.env.CONCEALED_MANUAL_PORT || 7836
server.listen(port, ()=>{ /* Do Nothing */})
// app.listen(port, ()=>{ /* Do Nothing */})
module.exports = app
