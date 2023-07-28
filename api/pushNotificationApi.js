const express = require('express')
const savePushSubscribe = require('../controllers/pushNotification/savePushSubscribe')
const router = express.Router()


// pushNotification
router.post('/savePushSubscribe', savePushSubscribe)



module.exports = router