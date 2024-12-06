const getDateGap = require("../../getDateGap")
const viralityEffect = require("./viralityEffect")

async function momentumAlgorithm({models, feedRef, contentType, triggeredEvent, userID, algorithm}) {
    const {propAlgorithm, cinema, bubble} = models
    const {v_len} = algorithm||{}
    const lapse_days = v_len||14
    
    let creatorID = feedRef.userID
    let algorithmData = null
    let newAlgorithmData = false
    algorithmData = await propAlgorithm.findOne({postID}).lean()
    if(!algorithmData){
        newAlgorithmData = true

        algorithmData = {
            userID: creatorID,
            postID,
            algType: "virality",
            contentType,
            feedRef,
            dateActivated: new Date().toISOString(),
            propagators: {},
        }
    }

    const now = new Date().toISOString()
    const createdDate = algorithmData.dateActivated
    const gap = getDateGap(createdDate, now, "day")
    const hasElapsed = gap>=lapse_days

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

module.exports = momentumAlgorithm