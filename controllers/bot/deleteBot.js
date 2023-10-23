const {doc, getDoc, updateDoc, deleteDoc, setDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const User = require('../../models/User')
const bot = require('../../models/bot')
const bubble = require('../../models/bubble')

async function deleteBot(req, res){
    const userID = req.body.userID
    const id = req.body.id
    const botPosts = [...req.body.botPosts]


    
    await deleteBotFromUser()
    async function deleteBotFromUser(){
        let thisUser = await User.findOne({id: userID}).lean()

        if(thisUser === null){
          return
        }

        const bots = [...thisUser.bots]

        for(let i=0; i<bots.length; i++){
            if(bots[i] === id){
                bots.splice(i, 1)
            }
        }

        thisUser.bots = bots
        // await thisUser.save()
        await User.updateOne({id: userID}, {bots: [...thisUser.bots]})
    }
    
    await deleteBotFromAllBubbles()
    async function deleteBotFromAllBubbles(){
        // loop through first
        for(let i=0; i<botPosts.length; i++){
            const current = botPosts[i]
            await deleteBotFromEachBubble(current)
        }
        
        async function deleteBotFromEachBubble(postID){
            const thisBubble = await bubble.findOne({postID}).lean()
            
            if(thisBubble === null){
                return
            }
            
            if(thisBubble.settings.botData[id]){
                delete thisBubble.settings.botData[id]
                // await thisBubble.save()
                await bubble.updateOne({postID}, {settings: thisBubble.settings})
            }
                
        }
    }

    await deleteThisBot().then(async()=>{
        const fire_ref = doc(database, "bots", id)
        await setDoc(fire_ref, {botNotFound: true}).catch(()=>{})
        res.send({successful:true})
    }).catch(()=>{
        res.send({successful:false})
    })

    async function deleteThisBot(){
        await bot.findOneAndDelete({id})
        
        // await Bot.findByIdAndRemove(mongoID)
        // await Bot.findByIdAndDelete(mongoID)
        // await Bot.deleteMany({id})
        // await Bot.deleteOne({id})
    }


}

module.exports = deleteBot