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
const dbObj = require('./api/dbObj')
const bot = require('./api/botApi')
const bubble = require('./api/bubbleApi')
const user = require('./api/userApi')
const pushNotification = require('./api/pushNotificationApi')

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

app.use('/api', dbObj)
app.use('/api/user', user)
app.use('/api/pushNotification', pushNotification)
app.use('/api/bot', bot)
app.use('/api/bubble', bubble)

app.use('/api/test', (req, res)=>{
    res.status(200).send('testing api')
})

app.use('/check', (req, res)=>{
    res.status(200).send('Server is working fine')
})

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

const port = process.env.PORT || process.env.CONCEALED_MANUAL_PORT || 5001
app.listen(port, ()=>{ /* Do Nothing */})
module.exports = app


// for vercel.json

// "outputDirectory": "frontend/build",