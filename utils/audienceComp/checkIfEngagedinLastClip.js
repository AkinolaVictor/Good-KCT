const { dataType } = require("../utilsExport")

async function checkIfEngagedinLastClip({creatorID, userID, models, feed}) {
    const {userCinema, cinemaPair} = models
    const allUserClips = await userCinema.findOne({creatorID})
    let pass = false
    
    if(allUserClips){
        const clips = [...allUserClips.cinema]
        const last = null

        for(let i=0; i<clips.length; i++){
            const curr = clips[i]
            const postID = curr?.postID
            if(postID === feed?.postID){
                const prev = clips[i-1]
                last = prev
            }
        }

        if(dataType(last) === "object"){
            const {postID} = last
            const clipPair = await cinemaPair.findOne({postID}).lean()
            if(clipPair){
                const reps = {...clipPair.allReplys}
                const repArr = Object.values(reps)
                for(let i=0; i<repArr.length; i++){
                    const curr = repArr[i]
                    if(dataType(curr)==="object"){
                        if(userID === curr?.userID){
                            pass = true
                            break
                        }
                    }
                }
            }
        }
    }

    return pass
}

module.exports = checkIfEngagedinLastClip