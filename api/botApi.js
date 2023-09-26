const express = require('express')
const router = express.Router()
const createBot = require('../controllers/bot/createBot')
const deleteBot = require('../controllers/bot/deleteBot')
const createTask = require('../controllers/bot/createTask')
const deleteTask = require('../controllers/bot/deleteTask')
const editTask = require('../controllers/bot/editTask')
const deactivateTask = require('../controllers/bot/deactivateTask')
const activateTask = require('../controllers/bot/activateTask')
const disengageBot = require('../controllers/bot/disengageBot')
const deleteBotActivity = require('../controllers/bot/deleteBotActivity')
const getAllBots = require('../controllers/bot/getAllBots')


// createbot
router.post('/createBot', createBot)

// delete bot
router.post('/deleteBot', deleteBot)

// create task
router.post('/createTask', createTask)

// delete task
router.post('/deleteTask', deleteTask)

// edit task
router.post('/editTask', editTask)

// deactivate task
router.post('/deactivateTask', deactivateTask)

// activate task
router.post('/activateTask', activateTask)

// disengage bot
router.post('/disengageBot', disengageBot)

// delete bot activity
router.post('/deleteBotActivity', deleteBotActivity)

// delete bot activity
router.post('/getAllBots', getAllBots)

module.exports = router
