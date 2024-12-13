const getDateGap = require("./getDateGap")


async function buildRetainedAudience({userID, models, which, feedRef, type, replierID_1, replierID_2, allowUserLike, allowParentLike, allowSubRep}) {
    const {retainedAudience} = models
    
    try {
        const creatorID = feedRef?.userID
        const {postID, creationDate} = feedRef

        const now = new Date().toISOString()
        const daysRaw = getDateGap(now, creationDate, "day")
        // const days = Math.floor(daysRaw)

        if(daysRaw > 30) return

        const newData = {
            postID,
            creation: creationDate,
            type,
            // owner: ,
            dateSeen: new Date().toISOString(),
        }
        const proto = {
            active: [
                {
                    ...newData
                }
            ],
            skipped: [
            ]
        }

        let userRetained = await retainedAudience.findOne({userID: creatorID}).lean()
        let createNew = false
        if(!userRetained) {
            createNew = true
            userRetained = {
                userID: creatorID,
                audience: {},
            }
        }

        if(createNew){
            if(which!=="impression") return
            const newAud = new retainedAudience({...proto})
            await newAud.save()
            return
        }
        const {audience} = userRetained
        const thisAudience = audience[userID]

        function inSkipped({thisAudience}){
            const {skipped} = thisAudience||{active: [], skipped: []}
            for(let i=0; i<skipped.length; i++){
                const current = skipped[i]
                const currentPostID = current.postID
                if(currentPostID === postID){
                    return true
                }
            }
            return false
        }

        function inActive({thisAudience}){
            const {active} = thisAudience||{active: [], skipped: []}
            let useThis = true
            for(let i=0; i<active.length; i++){
                const current = active[i]
                const currentPostID = current.postID
                if(currentPostID === postID){
                    return true
                }
            }
            return false
        }

        async function updateToImpression({active, skipped}){
            const checkActive = inActive({thisAudience})
            const checkSkipped = inSkipped({thisAudience})
            if(checkActive || checkSkipped) return
            
            let moveOn = true
            if(active?.length){
                active?.shift()
            }
            
            if(active.length===0){
                delete userRetained.audience[userID]
                moveOn = false
            }
            
            if(moveOn){
                if(skipped.length>=10){
                    userRetained.audience[userID].skipped?.shift()
                }
                userRetained.audience[userID].skipped?.push(newData)
            }
            
            await retainedAudience.updateOne({userID: creatorID}, {audience: userRetained.audience})
            return
        }

        async function updateLSR({skipped, active}) {
            
            const checkActive = inActive({thisAudience})
            if(checkActive) return
            
            const checkSkipped = inSkipped({thisAudience})
            if(checkSkipped){
                if(skipped.length>=10){
                    userRetained.audience[userID].skipped?.shift()
                }

                for(let i=0; i<skipped.length; i++){
                    const curr = skipped[i]
                    if(curr.postID === postID) {
                        skipped.splice(i, 1)
                        // break
                    }
                }
                userRetained.audience[userID].skipped = skipped
            }
        
            if(active.length>=5){
                userRetained.audience[userID].active?.shift()
            }
            
            userRetained.audience[userID].active?.push(newData)
            
            await retainedAudience.updateOne({userID: creatorID}, {audience: userRetained.audience})
            // return
        }

        async function updateSubRep({}) {
            // CONDITIONS
            // 1. IF YOU LIKE A REPLY AND ALSO REPLY THE REPLY, IT GOES TO THAT PERSON
            // 2. IF YOU LIKE 2 OR MORE REPLYS OF THE SAME PERSON, IT GOES TO THAT PERSON
            // 3. IF YOU'RE INVOLVED IN A TWO DEPTH SEQUENTIAL REPLYS, IT GOES TO BOTH OF YOU (MEANING: I REPLY, YOU REPLY ME, THEN YOU REPLY MY REPLY AND I REPLY AGAIN. MAKES 4 REPLYS IN TOTAL)
            
            let userRetained_1 = await retainedAudience.findOne({userID: replierID_1}).lean()
            if(userRetained_1 && (allowSubRep || allowUserLike)){
                const otherPerson = userRetained_1.audience[replierID_2]
                if(otherPerson){
                    const thisActive = userRetained_1.audience[replierID_2].active||[]
                    const active = inActive({thisAudience: otherPerson})
                    if(!active){
                        if(thisActive>=5){
                            userRetained_1.audience[replierID_2].active?.shift()
                        }
                        userRetained_1.audience[replierID_2].active?.push({...newData, replyTo: replierID_2})
                        await retainedAudience.updateOne({userID: replierID_1}, {audience: userRetained_1.audience})
                    }
                } else {
                    proto.active[0].replyTo = replierID_2
                    userRetained_2.audience[replierID_1] = proto
                    await retainedAudience.updateOne({userID: replierID_1}, {audience: userRetained_1.audience})
                }
            }

            let userRetained_2 = await retainedAudience.findOne({userID: replierID_2}).lean()
            if(userRetained_2 && (allowSubRep || allowParentLike)){
                const otherPerson = userRetained_2.audience[replierID_1]
                if(otherPerson){
                    const thisActive = userRetained_2.audience[replierID_1].active||[]
                    const active = inActive({thisAudience: otherPerson})
                    if(!active){
                        if(thisActive>=5){
                            userRetained_2.audience[replierID_1].active?.shift()
                        }
                        userRetained_2.audience[replierID_1].active?.push({...newData, replyTo: replierID_1})
                        await retainedAudience.updateOne({userID: replierID_2}, {audience: userRetained_2.audience})
                    }
                } else {
                    proto.active[0].replyTo = replierID_1
                    userRetained_2.audience[replierID_2] = proto
                    await retainedAudience.updateOne({userID: replierID_2}, {audience: userRetained_2.audience})
                }
            }
        }

        if(thisAudience){
            const active = userRetained.audience?.[userID]?.active
            const skipped = userRetained.audience?.[userID]?.skipped

            if(which==="impression"){
                await updateToImpression({active, skipped})
                return
            }
            
            if(which==="like" || which==="share" || which==="reply"){
                await updateLSR({skipped, active})
                return
            }
            
            if(which==="subreply" && (replierID_1 && replierID_2)){
                await updateSubRep({})
                return
            }
        } else {
            if(which==="like" || which==="share" || which==="reply"){
                userRetained.audience[userID] = proto
                await retainedAudience.updateOne({userID: creatorID}, {audience: userRetained.audience})
                return
            }
            
            if(which==="subreply" && (replierID_1 && replierID_2)){
                await updateSubRep({})
                return
            }
        }
    } catch(e){
        console.log(e);
        console.log("error from retained");
    }
    
}

module.exports = buildRetainedAudience