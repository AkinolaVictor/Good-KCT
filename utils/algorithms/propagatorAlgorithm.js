const momentumAlgorithm = require("./propagation/momentumAlgorithm")
const viralityAlgorithm = require("./propagation/viralityAlgorithm")

async function propagatorAlgorithm({models, feedRef, contentType, algoType, triggeredEvent, algorithm}) {
    // const {propAlgorithm} = models
    const type = algoType

    if(type === "virality"){
        await viralityAlgorithm({models, feedRef, contentType, triggeredEvent, userID, algorithm})
    }

    if(type === "momentum"){
        await momentumAlgorithm({models, feedRef, contentType, triggeredEvent, userID, algorithm})
    }
}

module.exports = propagatorAlgorithm