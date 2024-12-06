const express = require('express')
const algorithmPropagator = require('../controllers/general/algorithmPropagator')
const router = express.Router()

router.post('/algorithmPropagator', algorithmPropagator)

module.exports = router