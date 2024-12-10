const getDateGap = require("./getDateGap")


async function buildRetainedAudience({userID, models, which, feedRef, content, type}) {
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

        function inSkipped(){
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

        function inActive(){
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

        if(thisAudience){
            const active = userRetained.audience?.[userID]?.active
            const skipped = userRetained.audience?.[userID]?.skipped
            if(which === "impression"){
                const checkActive = inActive()
                const checkSkipped = inSkipped()
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
                    if(skipped.length>=5){
                        userRetained.audience[userID].skipped?.shift()
                        userRetained.audience[userID].skipped?.push(newData)
                    }
                }
                
                await retainedAudience.updateOne({userID: creatorID}, {audience: userRetained.audience})
                return
            }
            
            if(which==="like" || which==="share" || which==="reply"){
                const checkActive = inActive()
                if(checkActive) return
                
                const checkSkipped = inSkipped()
                if(checkSkipped){
                    for(let i=0; i<skipped.length; i++){
                        const curr = skipped[i]
                        if(curr.postID === postID) skipped.splice(i, 1)
                    }
                    userRetained.audience[userID].skipped = skipped
                }
            
                if(active.length>=5){
                    userRetained.audience[userID].active?.shift()
                }
                
                userRetained.audience[userID].active?.push(newData)
                
                await retainedAudience.updateOne({userID: creatorID}, {audience: userRetained.audience})
                return
            }
            
            if(which==="subreply"){
                // let userRetained = await retainedAudience.findOne({userID: creatorID}).lean()
            }
        } else {
            if(which==="like" || which==="share" || which==="reply"){
                userRetained.audience[userID] = proto
                await retainedAudience.updateOne({userID: creatorID}, {audience: userRetained.audience})
                return
            }
        }
    } catch(e){
        console.log(e);
        console.log("error from retained");
    }
    
}

module.exports = buildRetainedAudience