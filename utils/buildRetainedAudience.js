const getDateGap = require("./getDateGap")


async function buildRetainedAudience({userID, models, which, feedRef, content, type}) {
    const {retainedAudience} = models
    
    try {
        const creatorID = feedRef?.userID
        const {postID, creationDate} = feedRef
        let userRetained = await retainedAudience.findOne({userID: creatorID}).lean()
        let createNew = false
        if(!userRetained) {
            createNew = true
            userRetained = {
                userID: creatorID,
                audience: {},
            }
        }

        const {audience} = userRetained
        const thisAudience = audience[userID]
        const now = new Date().toISOString()
        const daysRaw = getDateGap(now, creationDate, "day")
        // const days = Math.floor(daysRaw)

        if(daysRaw > 30) return

        const proto = {
            active: [
                {
                    postID,
                    creationDate,
                    dateSeen: new Date().toISOString(),
                }
            ],
            skipped: [

            ]
        }

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
            if(which === "impression"){
                const engaged = true // use functions 
                if(engaged) return

                const checkActive = inActive()
                const checkSkipped = inSkipped()

                if(checkActive || checkSkipped) return


            }
        }

        // if(createNew){
        //     const starter = new retainedAudience({...userRetained})
        //     await starter.save()
        // } else {
        //     await retainedAudience.update({userID}, {})
        // }
    } catch(e){
        console.log(e);
        console.log("error from retained");
    }
    
}

module.exports = buildRetainedAudience