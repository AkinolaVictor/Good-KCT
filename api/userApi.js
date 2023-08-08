const express = require('express')
const router = express.Router()
const signUp = require('../controllers/user/signUp')
const signIn = require('../controllers/user/signIn')
const follow = require('../controllers/user/follow')
const unFollow = require('../controllers/user/unfollow')
const addAudience = require('../controllers/user/addAudience')
const deleteAudience = require('../controllers/user/deleteAudience')
const editAudience = require('../controllers/user/editAudience')
const sendUserEmail = require('../controllers/user/sendUserEmail')

// create an account
router.post('/createAccount', signUp)

// login
router.post('/signIn', signIn)

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



module.exports = router