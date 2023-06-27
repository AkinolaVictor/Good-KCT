const express = require('express')
const router = express.Router()
// const {database} = require('../database/firebase')
// const signUp = require('../controllers/user/signUp')
const createBubble = require('../controllers/bubble/createBubble')
const createReply_Old = require('../controllers/bubble/createReply')
const likeBubble_old = require('../controllers/bubble/likeBubble')

// create a bubble
router.post('/createBubble', createBubble)

// create a reply
router.post('/createReply', createReply_Old)

// create a like
// router.post('/createReply', likeBubble_old)


module.exports = router