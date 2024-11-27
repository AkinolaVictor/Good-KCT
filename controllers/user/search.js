const searchBubbles = require("../../utils/audienceComp/search/searchBubbles")
const searchClip = require("../../utils/audienceComp/search/searchClip")
const searchPeople = require("../../utils/audienceComp/search/searchPeople")

async function search(req, res) {
    const {userID, current, search} = req.body
    // const {eachUserAnalytics} = req.dbModels
    const models = req.dbModels

    try {
        let result = []
        if(current === "people"){
            const people = await searchPeople({searchText: search, models})
            result = people
        }
        if(current === "bubbles"){
            const bubbles = await searchBubbles({searchText: search, models, userID})
            result = bubbles
        }
        if(current === "clips"){
            const clips = await searchClip({searchText: search, models, userID})
            result = clips
        }
        res.send({successful: true, result})
    } catch(e){
        res.send({successful: false, result: []})
    }

}

module.exports = search