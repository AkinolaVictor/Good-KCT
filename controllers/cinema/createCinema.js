// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')
const { v4: uuidv4 } = require('uuid')

const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
// const sendPushNotification = require('../pushNotification/sendPushNotification')

async function createCinema(req, res){
    const userID = req.body.userID
    // const userName = req.body.userName
    const cinemaData = req.body.cinema
    // console.log({cinemaData, userID});
    // res.send({successful: false, message: 'upload encountered some errors'})
    // return
    const {cinema, cinemaPair, userCinema, cinemaFeeds, hashTags, allUser, notifications, cinemaForEveryone, Followers, clipRanks} = req.dbModels
    const settings = cinemaData.settings
    const secrecySettings = settings.secrecyData

    const feedRef = {
        userID,
        postID: cinemaData.postID,
        type: "clip",
        metaData: {
            aos: secrecySettings.atmosphere, 
            audienceCount: cinemaData.data.length,
            createdDate: cinemaData.createdDate,
            mention: {},
            hash: {}
        }
    }

    

    function discernUserIdentity(){
        if(secrecySettings.atmosphere === 'Night'){
            return true
        } else if(secrecySettings.atmosphere === 'Custom'){
            return true
        } else if(secrecySettings.atmosphere === 'Normal'){
            return true
        } else if(secrecySettings.atmosphere === 'Dark room'){
            return true
        } else if(secrecySettings.atmosphere === 'Man behind the scene'){
            return true
        } else if(secrecySettings.atmosphere === 'Anonymous'){
            return false
        } else if(secrecySettings.atmosphere === 'On mask'){
            return true
        } else if(secrecySettings.atmosphere === 'I see you all'){
            return false
        } else if(secrecySettings.atmosphere === 'Just know its me'){
            return false
        } else {
            return false
        }
    }

    async function createClipRank({feedRef}) {
        if(!feedRef) return
        const metadata = feedRef?.metaData||{}
        // const {audience, aos, hash, text, image, video} = metaData

        const cont = {
            userID,
            postID,
            engagement: {},
            metadata,
            lastengaged: new Date().toISOString()
        }

        const rankData = new clipRanks({...cont})
        await rankData.save()
    }

    async function updateHash(){
        const metaHash = feedRef.metaData.hash||{}
        const userHashs = [...Object.keys(metaHash)]
        const userHashTags = await hashTags.findOne({title: "batch_1"}).lean()

        if(userHashTags === null){
            const saveHash = {}
            for(let i=0; i<userHashs.length; i++){
                saveHash[userHashs[i]] = {
                    hash: userHashs[i],
                    count: {bub: 0, cin: 1},
                    lastUpdate: new Date().toISOString()
                }
            }

            const newHash = new hashTags({
                title: "batch_1", 
                allHashs: {
                    ...saveHash
                }
            })

            await newHash.save()
        } else {
            const {allHashs} = userHashTags
            for(let i=0; i<userHashs.length; i++){
                if(allHashs[userHashs[i]]){
                    allHashs[userHashs[i]].count.cin++
                    allHashs[userHashs[i]].lastUpdate = new Date().toISOString()
                } else {
                    allHashs[userHashs[i]] = {
                        hash: userHashs[i],
                        count: {bub: 0, cin: 1},
                        lastUpdate: new Date().toISOString()
                    }
                }
            }
            await hashTags.updateOne({title: "batch_1"}, {allHashs})
        }
    }

    const {data} = cinemaData
    let cinemaAudience = {}
    const mentioned = {}
    const hash = {}

    function getActualWord(word, multiple){
        const newWord = word.split("")
        newWord.shift()
        if(multiple === "two"){
            newWord.shift()
        }
        return newWord.join("")
    }

    for(let i=0; i<data.length; i++){
        const {audience, caption} = data[i]
        if(audience["Ai Audience"]){
            const aiAd = {...cinemaAudience?.["Ai Audience"], ...audience["Ai Audience"]}
            cinemaAudience = {...cinemaAudience, "Ai Audience": aiAd}
        } else {
            cinemaAudience = {...cinemaAudience, ...audience}
        }
        
        const captionContent = caption.split(" ")
        for(let j=0; j<captionContent.length; j++){
            const current = captionContent[j]
            const first = current[0]
            if(first === "@" && current.length>1){
                const actualWord = getActualWord(current)
                mentioned[actualWord] = true
            }

            if(first === "#" && first.length){
                const actualHash = getActualWord(current)
                hash[actualHash] = true
            }
        }
    }
    
    feedRef.metaData.audience = cinemaAudience
    feedRef.metaData.mention = mentioned
    feedRef.metaData.hash = hash

    const clpDat = cinemaData.data
    const meta = {video: 0, text: 0}
    for(let i=0; i<clpDat.length; i++){
        const {caption} = clpDat[i]
        if(caption.length>1){
            meta.text++
        }
        meta.video++
    }

    feedRef.metaData = {...feedRef.metaData, ...meta}
    cinemaData.feedRef = feedRef

    const audienceData = {
        forall: false,
        forfollowers: false,
        audience: []
    }

    if(cinemaAudience["Everyone"]){
        audienceData.forall = true
    } else if(cinemaAudience["My Followers"]){
        audienceData.forfollowers = true
    } else {
        audienceData.audience = [...Object.keys(cinemaAudience)]
    }

    function gatherAudience(){
        const {data} = cinemaData
        let cinemaAudience = {}
        const mentioned = {}
        const hash = {}

        function getActualWord(word, multiple){
            const newWord = word.split("")
            newWord.shift()
            if(multiple === "two"){
                newWord.shift()
            }
            return newWord.join("")
        }

        for(let i=0; i<data.length; i++){
            const {audience, caption} = data[i]
            cinemaAudience = {...cinemaAudience, ...audience}
            const captionContent = caption.split(" ")
            for(let j=0; j<captionContent.length; j++){
                const current = captionContent[j]
                const first = current[0]
                if(first === "@" && first.length>1){
                    const actualWord = getActualWord(current)
                    mentioned[actualWord] = true
                }

                if(first === "#" && first.length){
                    const actualHash = getActualWord(current)
                    hash[actualHash] = true
                }
            }
        }

        feedRef.metaData.audience = cinemaAudience
        feedRef.metaData.mention = mentioned
        feedRef.metaData.hash = hash
        cinemaData.feedRef = feedRef

        const returnData = {
            forall: false,
            forfollowers: false,
            audience: []
        }

        if(cinemaAudience["Everyone"]){
            returnData.forall = true
        } else if(cinemaAudience["My Followers"]){
            returnData.forfollowers = true
        } else {
            returnData.audience = [...Object.keys(cinemaAudience)]
        }

        return returnData

        if(  !(cinemaAudience["Everyone"] || cinemaAudience["My Followers"])  ){
            return [...Object.keys(cinemaAudience)]
        } else {
            return []
        }
    }

    async function informMentioned(){
        const metaMentions = feedRef.metaData.mention||{}
        const userMentioned = [...Object.keys(metaMentions)]

        if(!userMentioned.length) return
        
        const allConcealedUsers = await allUser.findOne({name: "Everyone"}).lean()
        if(!allConcealedUsers) return

        const userNotificationData = {
            when: new Date().toISOString(),
            message: `${cinemaData.fullname} mentioned you in a clip`,
            userID,
            feed: feedRef,
            type: "clipMention",
            creatorID: userID,
            bubbleID: cinemaData.postID,
            id: uuidv4(),
            identityStatus: discernUserIdentity()
        }

        for(let i=0; i<userMentioned.length; i++){
            const curr = userMentioned[i]
            const userNotif = await notifications.findOne({userID: curr}).lean()
            if(userNotif){
                userNotif.all.push(userNotificationData)
                await notifications.updateOne({userID: curr}, {all: userNotif.all})
                // await sendPushNotification(data.userID, notificationData, req)
            }
        }


        const data = {
            title: `Concealed Cinema`,
            body: userNotificationData.message,
            data: {
                type: "cinema",
                userID,
                feed: feedRef
            }
        }

        await sendPushNotification_2({userIDs: userMentioned, data, req})
    }

    async function sendAudiencePushNotification({audience}){
        let message = null
        if(discernUserIdentity()){
            message = "An annonymous cinema clip was shared with you, you might like to check it out"
        } else {
            message = `${cinemaData.fullname} shared a clip with you in the cinema, you might like to check it out`
        }   

        const data = {
            title: `Concealed`,
            body: message,
            data: {
                type: "cinema",
                userID,
                feed: feedRef   
            }
        }

        await sendPushNotification_2({
            userIDs: [...audience],
            data, req
        })
    }

    async function shareWithMyFollowings(){
        let cinemaAud = null
        if(audienceData.audience.length===0){
            const ffl = await Followers.findOne({userID}).lean()
            if(ffl) cinemaAud = [...Object.keys(ffl.followers)]
        } else {
            cinemaAud = [...audienceData.audience]
        }

        if(cinemaAud){
            for(let i=0; i<cinemaAud.length; i++){
                const current = cinemaAud[i]
                
                const cinemaFeed = await cinemaFeeds.findOne({userID: current}).lean()
                if(cinemaFeed === null){
                    const cinFeeds = new cinemaFeeds({userID: current, cinema: [feedRef]})
                    await cinFeeds.save().catch(()=>{ })
                } else {
                    cinemaFeed.cinema.push(feedRef)
                    await cinemaFeeds.updateOne({userID: current}, {cinema: [...cinemaFeed.cinema]}).catch(()=>{ })
                }
                
            }

            await sendAudiencePushNotification({audience: cinemaAud})
        }

    }

    async function addToUserCinemaPack(){
        // update user cinema
        const allUserCinema = await userCinema.findOne({userID}).lean()
        if(allUserCinema === null){
            const cinema = new userCinema({userID, cinema: [feedRef]})
            await cinema.save().catch(()=>{ })
        } else {
            allUserCinema.cinema.push(feedRef)    
            await userCinema.updateOne({userID}, {cinema: [...allUserCinema.cinema]}).catch(()=>{ })
        }   
    }

    async function addToCinemaForEveryone(){
        if(audienceData.forall){
            const cinForAll = await cinemaForEveryone.findOne({name: "Everyone"}).lean()
            if(!cinForAll){
                const newCinForAll = new cinemaForEveryone({name: "Everyone", cinemaRefs: [feedRef]})
                await newCinForAll.save()
            } else {
                cinForAll.cinemaRefs.push(feedRef)
                await cinemaForEveryone.findOneAndUpdate({name: "Everyone"}, {cinemaRefs: cinForAll.cinemaRefs})
            }
        }
    }

    async function createNewCinemaPair(){
        const buildRep = {}
        const buildLikes = {}
        const {data} = cinemaData

        for(let i=0; i<data.length; i++){
            buildLikes[data[i].id] = []
            buildRep[data[i].id] = []
        }

        const newCinemaPair = new cinemaPair({
            postID: cinemaData.postID,
            feedRef, 
            allReplys: {},
            likes: buildLikes,
            initRep: buildRep,
            analytics: {
                [userID]: {
                    userID,
                    num: 1
                }
            }
        })

        await newCinemaPair.save()
    }

    try {
        // audienceData    // build feedref and add feedref to cinemaData before sending it to db

        const newCinema = new cinema({...cinemaData})
        await newCinema.save().then(async()=>{
            await createNewCinemaPair()
            await addToUserCinemaPack()
            await shareWithMyFollowings()
            await updateHash()
            await informMentioned()
            await addToCinemaForEveryone()
            await createClipRank({feedRef})

            res.send({successful: true})
        }).catch((e)=>{
            console.log(e);
            console.log("failed to upload");
            res.send({successful: false, message: 'failed to upload to database'})
        })
    } catch (e) {
        console.log(e);
        console.log("failed");
        res.send({successful: false, message: 'upload encountered some errors'})
    }

    
    // res.send({successful: true})
}

module.exports = createCinema