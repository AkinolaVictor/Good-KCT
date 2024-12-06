const getDateGap = require("../../getDateGap")
const viralityEffect = require("./viralityEffect")

async function viralityAlgorithm({models, feedRef, contentType, triggeredEvent, userID, algorithm}){
    const {propAlgorithm, bubble, cinema} = models
    const {postID, createdDate} = feedRef
    const creatorID = feedRef.userID
    const {v_len} = algorithm||{}
    // const {propAlgorithm, reservedContents, Followers, userKnowledgebase} = models
    // const discernWhich = contentType === "clip"?"cinema":"bubbles"
    // const allHash = metaData?.hash||{}
    // const hashArr = Object.keys(allHash)
    
    const now = new Date().toISOString()
    const gap = getDateGap(createdDate, now, "day")
    const lapse_days = v_len||14
    const hasElapsed = gap >= lapse_days

    let algorithmData = null
    let newAlgorithmData = false
    algorithmData = await propAlgorithm.findOne({postID}).lean()
    if(!algorithmData && !hasElapsed){
        newAlgorithmData = true

        algorithmData = {
            userID: creatorID,
            postID,
            algType: "virality",
            contentType,
            feedRef,
            dateActivated: createdDate,
            propagators: {},
        }
    }

    if(hasElapsed){
        await propAlgorithm.findOneAndDelete({postID})
        if(contentType==="clip"){
            await cinema.updateOne({postID}, {viral: true})
        } else {
            await bubble.updateOne({postID}, {viral: true})
        }
        return
    }

    if(algorithmData?.propagators?.[userID]){
        return
    }

    algorithmData.propagators = {
        ...algorithmData.propagators, 
        [userID]: `${triggeredEvent}`
    }

    if(newAlgorithmData){
        const createAlg = new propAlgorithm({...algorithmData})
        await createAlg.save()
    } else {
        const propagators = algorithmData.propagators
        await propAlgorithm.updateOne({postID}, {propagators})
    }

    await viralityEffect({models, userID, feedRef, contentType, algorithm})
    
}

module.exports = viralityAlgorithm