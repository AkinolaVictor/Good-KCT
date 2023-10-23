// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
const bot = require('../../models/bot')
const date = require('date-and-time')

async function getAllBots(req, res){
    const userBots = req.body.userBots
    const now = new Date()
    const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')

    try{
        const botList = await bot.find({id: {$in: [...userBots]}}).lean()
        if(botList){
            res.send({successful: true, bots: botList, formattedDate})
        } else{
            res.send({successful: false, message: 'Data not found', bots: [], formattedDate})
        }
    } catch(e){
        res.send({successful: false, bots: [], formattedDate})
    }
}

module.exports = getAllBots