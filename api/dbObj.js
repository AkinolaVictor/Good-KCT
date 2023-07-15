const express = require('express')
const router = express.Router()
const database = require('../database/firebase')
// const getAuth = require('firebase/auth').getAuth

// console.log(getAuth());
router.post('/getDatabase', async (req, res)=>{
    // get it from server
    if(req.body.password === '0123456789'){
    // if(req.body.password === process.env.CONCEALED_APP_CONNECTION_KEY){
        res.send({
            successful: true,
            ...database.config,
            // userAuth: getAuth()
        })
    }
})
// console.log(getAuth());
router.post('/getPlaygroundDatabase', async (req, res)=>{
    // get it from server
    if(req.body.password === '0123456789'){
    // if(req.body.password === process.env.CONCEALED_APP_CONNECTION_KEY){
        res.send({
            successful: true,
            ...database.playgroundConfig
            // userAuth: getAuth()
        })
    }
})

module.exports = router