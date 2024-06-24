const watchBotActivityStream = require("./watchBotActivityStream")
const watchBotStream = require("./watchBotStream")
const watchBubblesForEveryoneStream = require("./watchBubbleForEveryoneStream")
const watchBubbleStream = require("./watchBubbleStream")
const watchChatsStream = require("./watchChatsStream")
const watchFollowerStream = require("./watchFollowerStream")
const watchFollowingtream = require("./watchFollowingStream")
const watchNotificationStream = require("./watchNotificationStream")
const watchSavedAudienceStream = require("./watchSavedAudienceStream")
const watchUserBubblesStream = require("./watchUserBubblesStream")
const watchUserFeedsStream = require("./watchUserFeedsStream")
const watchUserLikesStream = require("./watchUserLikesStream")
const watchUserRepliesStream = require("./watchUserRepliesStream")
const watchUserShareStream = require("./watchUserShareStream")
const watchUserStream = require("./watchUserStream")

function watchAllStreams(models, socket, io){
    console.log("starting to watch");
    watchBotActivityStream(models, socket, io)
    watchBotStream(models, socket, io)
    watchUserFeedsStream(models, socket, io)
    watchBubbleStream(models, socket, io)
    watchBubblesForEveryoneStream(models, socket, io)
    watchNotificationStream(models, socket, io)
    watchUserLikesStream(models, socket, io)
    watchUserRepliesStream(models, socket, io)
    watchUserShareStream(models, socket, io)
    watchUserStream(models, socket, io)
    watchChatsStream(models, socket, io)
    watchUserBubblesStream(models, socket, io)
    
    watchSavedAudienceStream(models, socket, io)
    watchFollowerStream(models, socket, io)
    watchFollowingtream(models, socket, io)
    console.log("watching...");
}

module.exports = watchAllStreams