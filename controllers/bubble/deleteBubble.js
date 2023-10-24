const {database, storage} = require('../../database/firebase')
const {doc, setDoc} = require('firebase/firestore')
const { ref, deleteObject} = require('firebase/storage')
// const date = require('date-and-time')
// const bubble = require('../../models/bubble')
// const bot = require('../../models/bot')
// const Feeds = require('../../models/Feeds')
// const userBubbles = require('../../models/userBubbles')
// const userReplies = require('../../models/userReplies')
// const userShares = require('../../models/userShares')
// const bubblesForEveryone = require('../../models/bubblesForEveryone')
// const LikeModel = require('../../models/LikeModel')

async function deleteBubble(req, res){
    const {LikeModel, bubblesForEveryone, userBubbles, Feeds, userShares, userReplies, bot, bubble} = req.dbModels

    // const userID = req.body.userID
    // const postID = req.body.postID // thisBubble.postID
    const thisBubble = {...req.body.thisBubble}
    // console.log(thisBubble);

    const bubblex = thisBubble.bubble
    const allFilePaths = []

    // prepare all files to be deleted by pushing their path to the allFilesPath
    for(let i=0; i<bubblex.length; i++){
        const files = bubblex[i].file
        for(let j=0; j<files.length; j++){
            const file = files[j]
            allFilePaths.push(file.path)
        }
    }

    if(allFilePaths.length){
        // first delete all files before deleting post (if there are files to be deleted)
        for(let i=0; i<allFilePaths.length; i++){
            const path=allFilePaths[i].join('/')
            const fileRef = ref(storage, path);
            
            // delete files now
            await deleteObject(fileRef).then(async()=>{ 
                if(i===allFilePaths.length-1){
                    // then delete post when all files have been deleted
                    await delBubble()
                }
            }).catch((err)=>{
                // console.log('failed down');
                res.send({successful: false, message: 'unable to delete files'})
                return
            })
        }
    } else {
        // if there are no paths, just delete post
        await delBubble()
    }

    async function delBubble(){
        const flaggedBubble = await bubble.findOne({postID: thisBubble.postID}).lean()
        if(flaggedBubble === null){
            res.send({successful: false, message: 'Bubble not found'})
        } else {
            if(typeof(flaggedBubble.activities)==="string"){
                const activities = JSON.parse(flaggedBubble.activities)
                flaggedBubble.activities = activities
            }

            const everyoneWhoHasIt = [...Object.keys(flaggedBubble.activities.iAmOnTheseFeeds)]
            const bots = [...Object.keys(flaggedBubble.settings.botData)]
            for(let i=0; i<bots.length; i++){
                const thisBot = await bot.findOne({id: bots[i]}).lean()
                if(thisBot){
                    for(let j=0; j<thisBot.data.length; j++){
                        if(thisBot.data[j]===thisBubble.postID){
                            thisBot.data.splice(j, 1)
                            await bot.updateOne({id: bots[i]}, {data: thisBot.data})
                            break
                        }
                    }
                }
            }


            for(let j=0; j<everyoneWhoHasIt.length; j++){
                const currentID = everyoneWhoHasIt[j]
                const userFeed = await Feeds.findOne({userID: currentID})
                if(userFeed){
                    for(let i=0; i<userFeed.bubbles.length; i++){
                        const current = userFeed.bubbles[i]
                        if(current.postID === thisBubble.postID){
                            userFeed.bubbles[i]='deleted'
                        }
                    }
                    // await userFeed.save()
                    await Feeds.updateOne({userID: currentID}, {bubbles: [...userFeed.bubbles]})
                }

                const thisUserbubbles = await userBubbles.findOne({userID: currentID})
                if(thisUserbubbles){
                    for(let i=0; i<thisUserbubbles.bubbles.length; i++){
                        const current = thisUserbubbles.bubbles[i]
                        if(current.postID === thisBubble.postID){
                            thisUserbubbles.bubbles[i]='deleted'
                        }
                    }
                    // await thisUserbubbles.save()
                    await userBubbles.updateOne({userID: currentID}, {bubbles: thisUserbubbles.bubbles})
                }

                const thisUserReplies = await userReplies.findOne({userID: currentID})
                if(thisUserReplies){
                    for(let i=0; i<thisUserReplies.bubbles.length; i++){
                        const current = thisUserReplies.bubbles[i]
                        if(current.postID === thisBubble.postID){
                            thisUserReplies.bubbles[i]='deleted'
                        }
                    }
                    // await thisUserReplies.save()
                    await userReplies.updateOne({userID: currentID}, {bubbles: [...thisUserReplies.bubbles]})
                }

                const thisUserLikes = await LikeModel.findOne({userID: currentID})
                // const thisUserLikes = await userLikes.findOne({userID: currentID})
                if(thisUserLikes){
                    for(let i=0; i<thisUserLikes.bubbles.length; i++){
                        const current = thisUserLikes.bubbles[i]
                        if(current.postID === thisBubble.postID){
                            thisUserLikes.bubbles[i]='deleted'
                        }
                    }
                    // await thisUserLikes.save()
                    await LikeModel.updateOne({userID: currentID}, {bubbles: [...thisUserLikes.bubbles]})
                }

                const thisuserShares = await userShares.findOne({userID: currentID})
                if(thisuserShares){
                    for(let i=0; i<thisuserShares.bubbles.length; i++){
                        const current = thisuserShares.bubbles[i]
                        if(current.postID === thisBubble.postID){
                            thisuserShares.bubbles[i]='deleted'
                        }
                    }
                    // await thisuserShares.save()
                    await userShares.updateOne({userID: currentID}, {bubbles: [...thisuserShares.bubbles]})
                }

                if(j===everyoneWhoHasIt.length-1){
                    const publicBubbles = await bubblesForEveryone.findOne({name: "Everyone"})
                    if(publicBubbles){
                        for(let i=0; i<publicBubbles.bubbleRefs.length; i++){
                            const current = publicBubbles.bubbleRefs[i]
                            if(current.postID === thisBubble.postID){
                                publicBubbles.bubbleRefs[i]='deleted'
                            }
                        }
                        // await publicBubbles.save()
                        await bubblesForEveryone.updateOne({name: "Everyone"}, {bubbleRefs: [...publicBubbles.bubbleRefs]})
                    }

                    await bubble.findOneAndDelete({postID: thisBubble.postID}).then(async()=>{
                        const fire_ref = doc(database, "bubbles", thisBubble.postID)
                        await setDoc(fire_ref, {bubbleNotFound: true}).catch(()=>{})
                        res.send({successful: true})
                    }).catch(()=>{
                        res.send({successful: false, message: 'failed to delete bubble'})
                    })
                }

            }
        }
    }

}

module.exports = deleteBubble