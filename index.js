const env = require('dotenv').config();
const express = require("express")
const app = express()
const helmet = require('helmet')
const path = require("path")
const morgan = require("morgan")
const cors = require("cors")
// const userAuth = require('./api/createAccount')

// routes
const createAccount = require('./api/createAccount')
const dbObj = require('./api/dbObj')
const signIn = require('./api/signIn')
const bot = require('./api/botApi')
const bubble = require('./api/bubbleApi')

// console.log(process.env.REACT_APP_DB_API_KEY);
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())

// console.log(process.env.CONCEALED_STORAGE_BUCKET);
// console.log(dbObj);
// conditional based om env
app.use(morgan("dev")) //dev, tiny, ...

app.use('/api', dbObj)
app.use('/api/user', createAccount)
app.use('/api/user', signIn)
app.use('/api/bot', bot)
app.use('/api/bubble', bubble)

app.use('/api/test', (req, res)=>{
    res.status(200).send('testing api')
})

app.use(express.static(path.join(__dirname, "./frontend/build")))

app.get("*", function(_, res){
    res.sendFile(
        path.join(__dirname, "./frontend/build/index.html"),
        function(err){
            if(err){
                res.status(500).send(err)
            }
        }
    )
})

const port = process.env.PORT || 5001
app.listen(port, ()=>{ /* Do Nothing */})

module.exports = app


// for vercel.json

// "outputDirectory": "frontend/build",