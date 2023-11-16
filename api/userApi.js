const express = require('express')
const router = express.Router()
// const signUp = require('../controllers/user/signUp')
// const signIn = require('../controllers/user/signIn')
const follow = require('../controllers/user/follow')
const unFollow = require('../controllers/user/unfollow')
const addAudience = require('../controllers/user/addAudience')
const deleteAudience = require('../controllers/user/deleteAudience')
const editAudience = require('../controllers/user/editAudience')
const sendUserEmail = require('../controllers/user/sendUserEmail')
const getAllUsers = require('../controllers/user/getAllUsers')
const userDailyAnalytics = require('../controllers/user/userDailyAnalytics')
const updateUserProfile = require('../controllers/user/updateUserProfile')
const savePushSubscribe = require('../controllers/pushNotification/savePushSubscribe')
const getUsers = require('../controllers/user/getUsers')
const getUserBubbles = require('../controllers/user/getUserBubbles')
const getUserFollowers = require('../controllers/user/getUserFollowers')
const getUserFollowings = require('../controllers/user/getUserFollowings')
const getUserLikes = require('../controllers/user/getUserLikes')
const getUserShares = require('../controllers/user/getUserShares')
const getUserReplies = require('../controllers/user/getUserReplies')
const initializeUser = require('../controllers/user/initializeUser')
const createNewUser = require('../controllers/user/createNewUser')
const deleteNotification = require('../controllers/user/deleteNotification')
const changeProfileImages = require('../controllers/user/changeProfileImages')
const deleteProfileImages = require('../controllers/user/deleteProfileImage')
const getUserNotification = require('../controllers/user/getUserNotification')
const getUserBotActivities = require('../controllers/user/getUserBotActivities')
// const addToWaitlist = require('../controllers/waitlist/addToWaitList')
const checkUserFollowers = require('../controllers/user/checkUserFollowers')
const addAudienceToWaitlist = require('../controllers/waitlist/addAudienceToWaitlist')
// const addToWaitlist = requir../controllers/waitlist/addAudienceToWaitlistist')

// create an account
// router.post('/createAccount', signUp)

// login
// router.post('/signIn', signIn)

// follow
router.post('/follow', follow)

// unfollow
router.post('/unFollow', unFollow)

// add Audience
router.post('/addAudience', addAudience)

// delete Audience
router.post('/deleteAudience', deleteAudience)

// delete Audience
router.post('/editAudience', editAudience)

// delete Audience
router.post('/sendUserEmail', sendUserEmail)

// delete Audience
router.post('/getAllUsers', getAllUsers)

// delete Audience
router.post('/userDailyAnalytics', userDailyAnalytics)

// delete Audience
router.post('/updateUserProfile', updateUserProfile)

// pushNotification
router.post('/savePushSubscribe', savePushSubscribe)

// pushNotification
router.post('/getUsers', getUsers)

// pushNotification
router.post('/getUserBubbles', getUserBubbles)

// pushNotification
router.post('/getUserFollowers', getUserFollowers)

// pushNotification
router.post('/getUserFollowings', getUserFollowings)

// pushNotification
router.post('/getUserLikes', getUserLikes)

// pushNotification
router.post('/getUserShares', getUserShares)

// pushNotification
router.post('/getUserReplies', getUserReplies)

// pushNotification
router.post('/initializeUser', initializeUser)

// pushNotification
router.post('/createNewUser', createNewUser)

// pushNotification
router.post('/deleteNotification', deleteNotification)

// pushNotification
router.post('/changeProfileImages', changeProfileImages)

// pushNotification
router.post('/deleteProfileImage', changeProfileImages)

// pushNotification
router.post('/deleteProfileImages', deleteProfileImages)

// pushNotification
router.post('/getUserNotification', getUserNotification)

// pushNotification
router.post('/getUserBotActivities', getUserBotActivities)

router.post('/addToWaitlist', addAudienceToWaitlist)

router.post('/checkUserFollowing', checkUserFollowers)



module.exports = router