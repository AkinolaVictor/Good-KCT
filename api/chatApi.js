const express = require('express')
const router = express.Router()
const initializeChats = require('../controllers/chats/initializeChats')
const setupChat = require('../controllers/chats/setupChat')
const sendMessage = require('../controllers/chats/sendMessage')
const seenMessage = require('../controllers/chats/seenMessage')
const deleteMessage = require('../controllers/chats/deleteMessage')
const removeMessage = require('../controllers/chats/removeMessage')


router.post('/initializeChats', initializeChats)
router.post('/setupChat', setupChat)
router.post('/sendMessage', sendMessage)
router.post('/seenMessage', seenMessage)
router.post('/deleteMessage', deleteMessage)
router.post('/removeMessage', removeMessage)


module.exports = router
