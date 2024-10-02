const express = require('express')
const router = express.Router()
const createCinema = require('../controllers/cinema/createCinema')
const deleteCinema = require('../controllers/cinema/deleteCinema')
const deleteCinemaForMe = require('../controllers/cinema/deleteCinemaFromMe')
const getCinemaForEveryone = require('../controllers/cinema/getCinemaForEveryone')
const cinemaServer = require('../controllers/cinema/cinemaServer')
const getCinema = require('../controllers/cinema/getCinema')
const getMultipleCinema = require('../controllers/cinema/getMultipleCinema')
const likeClip = require('../controllers/cinema/likeClip')
const dislikeClip = require('../controllers/cinema/dislikeClip')
const getClipPair = require('../controllers/cinema/getClipPair')
const createCinemaReply = require('../controllers/cinema/createCinemaReply')
const likeClipReply = require('../controllers/cinema/likeClipReply')
const shareClip = require('../controllers/cinema/shareClip')
const confirmClipShare = require('../controllers/cinema/confirmClipShare')
const denyClipShare = require('../controllers/cinema/denyClipShare')




router.post('/createCinema', createCinema)
router.post('/deleteCinema', deleteCinema)
router.post('/deleteCinemaForMe', deleteCinemaForMe)
router.post('/getCinemaForEveryone', getCinemaForEveryone)
router.post('/cinemaServer', cinemaServer)
router.post('/getCinema', getCinema)
router.post('/getMultipleCinema', getMultipleCinema)
router.post('/likeClip', likeClip)
router.post('/dislikeClip', dislikeClip)
router.post('/getClipPair', getClipPair)
router.post('/createCinemaReply', createCinemaReply)
router.post('/likeClipReply', likeClipReply)
router.post('/shareClip', shareClip)
router.post('/confirmClipShare', confirmClipShare)
router.post('/denyClipShare', denyClipShare)

module.exports = router