const {database} = require('../../database/firebase')
// import { database } from '../database/firebase'
// import {createUserWithEmailAndPassword, getAuth} from 'firebase/auth'
const {getAuth} = require('firebase/auth')
const {createUserWithEmailAndPassword} = require('firebase/auth')
// import {collection, addDoc, updateDoc, doc, setDoc, onSnapshot, getDoc} from 'firebase/firestore'
const {setDoc} = require('firebase/firestore')
const {doc} = require('firebase/firestore')


const auth = getAuth()
async function signUp(req, res){
    const fullname= req.body.fullname
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password1
    createUserWithEmailAndPassword(auth, email, password)
    .then(async(result)=>{
        const data = {
            id: result.user.uid,
            userInfo: {
                fullname,
                username,
                email: req.body.email,
                phoneNo: password,
                about: '',
                dateJoined: result.user.metadata.creationTime,
                fireStoreInfo: {
                    uid: result.user.uid,
                    metaData: {...result.user.metadata},
                    reloadUserInfo: result.user.reloadUserInfo
                }
            },
            posts: [],
            feed:[],
            chats: [],
            audience: {},
            followers: {},
            following: {},
            profile: {},
            bots:[],
            likes: [],
            replies: [],
            shares: [],
            bubbles: [],
            profilePhotoUrl: '',
            coverPhotoUrl: ''
        }
        await setDoc(doc(database, "users", result.user.uid), {...data}).then(()=>{
            // res.send({successful: true, result, data})
            res.send({successful: true, data})
        })
        // console.log(result);
        // res.send({...result})
    }).catch((err)=>{
        // console.log('create', err.code);
        // console.log(err.message, err.code);

        // request errors
        // email-already-in-use
        if(err.code === 'auth/invalid-email') res.send({successful: false, message: 'Email was badly formatted'})
        else if(err.code === 'auth/invalid-password') res.send({successful: false, message: 'Incorrect username or password'})
        else if(err.code === 'auth/email-already-in-use') res.send({successful: false, message: 'This email address has already been used'})
        else if(err.code === 'auth/wrong-password') res.send({successful: false, message: 'Incorrect username or password'})
        else if(err.code === 'auth/network-request-failed') res.send({successful: false, message: 'Kindly check your network, there seem to be a network problem'})
        else if(err.code === 'auth/user-not-found') res.send({successful: false, message: 'Sorry, you have no account, sign up to create a new account'})
        else res.send({successful: false, message: 'An error was encountered'})
    })
}

module.exports = signUp