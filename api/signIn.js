const express = require('express')
const signIn = require('../controllers/user/signIn')
const router = express.Router()
const getAuth = require('firebase/auth').getAuth
// const {signInWithEmailAndPassword} = require('firebase/auth')

// console.log(database);
const auth = getAuth()
router.post('/signin', signIn)
// router.post('/user/signin', async (req, res)=>{
//     signInWithEmailAndPassword(auth, req.body.email, req.body.password)
//     .then(async(result)=>{
//         const userID = result.user.uid
//         res.send({successful: true, userID})
//     }).catch((err)=>{
//         // request errors
//         // email-already-in-use
//         if(err.code === 'auth/invalid-email') res.send({successful: false, message: 'Email was badly formatted'})
//         else if(err.code === 'auth/invalid-password') res.send({successful: false, message: 'Incorrect username or password'})
//         else if(err.code === 'auth/wrong-password') res.send({successful: false, message: 'Incorrect username or password'})
//         else if(err.code === 'auth/network-request-failed') res.send({successful: false, message: 'Kindly check your network, there seem to be a network problem'})
//         else if(err.code === 'auth/user-not-found') res.send({successful: false, message: 'Sorry, you have no account, sign up to create a new account'})
//         else res.send({successful: false, message: 'An error was encountered'})
//     })
// })

module.exports = router