const bubble = require("../controllers/socket/bubble")
const bubbleRefs_everyone = require("../controllers/socket/bubbleRefs_everyone")
const userBotActivities = require("../controllers/socket/userBotActivities")
const userBots = require("../controllers/socket/userBots")
const userChats = require("../controllers/socket/userChats")
const userInfo = require("../controllers/socket/userInfo")
const userNotification = require("../controllers/socket/userNotification")

function socketApi(socket, io){
    bubbleRefs_everyone(socket, io)
    userBots(socket, io)
    userChats(socket, io)
    userNotification(socket, io)
    userBotActivities(socket, io)
    userInfo(socket, io)
    bubble(socket, io)
}

module.exports = socketApi