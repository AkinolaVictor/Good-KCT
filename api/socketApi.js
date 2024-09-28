const bubble = require("../controllers/socket/bubble")
const bubbleRefs_everyone = require("../controllers/socket/bubbleRefs_everyone")
const userBotActivities = require("../controllers/socket/userBotActivities")
const userBots = require("../controllers/socket/userBots")
const userChats = require("../controllers/socket/userChats")
const userInfo = require("../controllers/socket/userInfo")
const userNotification = require("../controllers/socket/userNotification")
const socketBotActivitiesWatch = require("../controllers/watches/socketBotActivitiesWatch")
const socketBotWatch = require("../controllers/watches/socketBotWatch")
const socketBubbleForEveryone = require("../controllers/watches/socketBubbleForEveryone")
const socketBubbleWatch = require("../controllers/watches/socketBubbleWatch")
const socketChatWatch = require("../controllers/watches/socketChatWatch")
const socketCinemaForEveryone = require("../controllers/watches/socketCinemaForEveryone")
const socketNotificationWatch = require("../controllers/watches/socketNotificationWatch")
const socketSubscribedClips = require("../controllers/watches/socketSubscribedClips")
const socketUserInfoWatch = require("../controllers/watches/socketUserInfoWatch")
// const socketUpload = require("../controllers/watches/socketUpload")

function socketApi(models, socket, io){
    console.log("starting to watch...");
    // bubbleRefs_everyone(socket, io)
    // userBots(socket, io)
    // userChats(socket, io)
    // userNotification(socket, io)
    // userBotActivities(socket, io)
    // userInfo(socket, io)
    // bubble(socket, io)


    socketUserInfoWatch(models, socket, io)
    socketBubbleForEveryone(models, socket, io)
    socketCinemaForEveryone(models, socket, io)
    socketSubscribedClips(models, socket, io)
    socketBotWatch(models, socket, io)
    socketChatWatch(models, socket, io)
    socketNotificationWatch(models, socket, io)
    socketBotActivitiesWatch(models, socket, io)
    socketBubbleWatch(models, socket, io)
    // socketUpload(models, socket, io)
    
    console.log("watching...");
}

module.exports = socketApi