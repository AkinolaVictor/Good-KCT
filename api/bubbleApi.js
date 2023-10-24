const express = require('express')
const router = express.Router()
const createBubble = require('../controllers/bubble/createBubble')
const createReply_Old = require('../controllers/bubble/createReply')
const deleteBubble = require('../controllers/bubble/deleteBubble')
const likeBubble = require('../controllers/bubble/likeBubble')
const dislikeBubble = require('../controllers/bubble/dislikeBubble')
const openedReply = require('../controllers/bubble/openedReply')
const openedChart = require('../controllers/bubble/openedChart')
// const impression = require('../controllers/bubble/impression')
const shareBubble = require('../controllers/bubble/shareBubble')
const deleteBubbleForMe = require('../controllers/bubble/deleteBubbleForMe')
// const hideBubbleForMe = require('../controllers/bubble/hideBubbleFromMe')
const deleteReply = require('../controllers/bubble/deleteReply')
const likeReply = require('../controllers/bubble/likeReply')
const dislikeReply = require('../controllers/bubble/dislikeReply')
const denyShareRequest = require('../controllers/bubble/denyShareRequest')
const confirmShareRequest = require('../controllers/bubble/confirmShareRequest')
const registerAudience = require('../controllers/bubble/registerAudience')
const bubbleBotUpdate = require('../controllers/bubble/bubbleBotUpdate')
const updateImpression = require('../controllers/bubble/updateImpression')
const getBubblesForEveryone = require('../controllers/bubble/getBubblesForEveryone')
const getBasicBubble = require('../controllers/bubble/getBasicBubble')
const checkReplyEligibity = require('../controllers/bubble/checkReplyEligibity')
// console.log(router);
// create a bubble
router.post('/createBubble', createBubble)

// delete bubble
router.post('/deleteBubble', deleteBubble)

// delete bubble
router.post('/deleteBubbleForMe', deleteBubbleForMe)

// delete bubble
// router.post('/hideBubbleForMe', hideBubbleForMe)

// create a reply
router.post('/createReply', createReply_Old)

// create a reply
router.post('/deleteReply', deleteReply)

// create a reply
router.post('/likeReply', likeReply)

// create a reply
router.post('/dislikeReply', dislikeReply)

// like bubble
router.post('/like', likeBubble)

// dislike bubble
router.post('/dislike', dislikeBubble)

// opened reply
router.post('/openedReply', openedReply)

// opened chart
router.post('/openedChart', openedChart)

// opened chart
// router.post('/impression', impression)

// opened chart
router.post('/shareBubble', shareBubble)

// register Audience
router.post('/registerAudience', registerAudience)

// opened chart
router.post('/denyShareRequest', denyShareRequest)

// opened chart
router.post('/confirmShareRequest', confirmShareRequest)

// opened chart
router.post('/bubbleBotUpdate', bubbleBotUpdate)

// opened chart
router.post('/updateImpression', updateImpression)

// opened chart
router.post('/getBubblesForEveryone', getBubblesForEveryone)

// opened chart
router.post('/getBasicBubble', getBasicBubble)

// opened chart
router.post('/checkReplyEligibity', checkReplyEligibity)


module.exports = router