const propagatorAlgorithm = require("../../utils/algorithms/propagatorAlgorithm")

async function algorithmPropagator(req, res) {
    const models = req.dbModels
    const {feedRef, contentType, algoType, triggeredEvent, algorithm} = req.body

    await propagatorAlgorithm({models, feedRef, contentType, algoType, triggeredEvent, algorithm})

    res.send({successful: true})
}

module.exports = algorithmPropagator