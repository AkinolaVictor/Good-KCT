const dataType = require("../../utils/dataType")
const getInterestBasedClips = require("../../utils/getInterestBasedClips")
const getMostRecurrentInterest = require("../../utils/getMostRecurrentInterest")
const getRandomClips = require("../../utils/getRandomClips")
const getReservedContents = require("../../utils/getReservedContents")

async function cinemaServer_v2(req, res) {
    const models = req.dbModels
    const {cinemaForEveryone, cinemaFeeds} = models

    const userID = req.body.userID
    const seen = req.body.seen||[]
    const where = req.body.where
    const interactions = req.body.interactions
    const count = req.body.count||20


    try {
        let clipRefs = []
        if(where==="for all"){
            const allCinema = await cinemaForEveryone.findOne({name: "Everyone"}).lean()
            const allCinRefs = [...allCinema.cinemaRefs].reverse()
            if(allCinema) clipRefs = [...clipRefs, ...allCinRefs]
        }
        
        if(where==="following"){
            const cinFeed = await cinemaFeeds.findOne({userID}).lean()
            const cinFeedRefs = [...cinFeed.cinema].reverse()
            if(cinFeed) clipRefs=[...clipRefs, ...cinFeedRefs]
        }
        
        if(where==="aos"){
            const allCinema = await cinemaForEveryone.findOne({name: "Everyone"}).lean()
            const allCinRefs = [...allCinema.cinemaRefs].reverse()
            if(allCinema) clipRefs = [...clipRefs, ...allCinRefs]

            const cinFeed = await cinemaFeeds.findOne({userID}).lean()
            const cinFeedRefs = [...cinFeed.cinema].reverse()
            if(cinFeed) clipRefs=[...clipRefs, ...cinFeedRefs]
        }

        // console.log({});
        

        let stored = []
        let interestBasedContents = []
        if(where!=="following"){
            const interestsKnowledge = await getMostRecurrentInterest({models, userID, unique: 50})||{}
            interestBasedContents = await getInterestBasedClips({models, clipRefs, interestsKnowledge, userID, seen, where, count})
        }
        
        
        const randomBubbles = await getRandomClips({models, clipRefs, userID, seen, interestBasedContents, count, where})
        const reserved = await getReservedContents({models, which: "clip", userID, seen, interestBasedContents, where, count})

        // const frontDisplayPattern = []
        for(let i=0; i<count; i+=2){
            const first = dataType(interestBasedContents[i])==="object"?interestBasedContents[i]:null
            const first_next = dataType(interestBasedContents[i+1])==="object"?interestBasedContents[i+1]:null
            const second = dataType(randomBubbles[i])==="object"?randomBubbles[i]:null
            const second_next = dataType(randomBubbles[i+1])==="object"?randomBubbles[i+1]:null
            const third = dataType(reserved[i])==="object"?reserved[i]:null
            const third_next = dataType(reserved[i+1])==="object"?reserved[i+1]:null

            if(first) stored.push(first)
            if(first_next) stored.push(first_next)
            if(second) stored.push(second)
            if(second_next) stored.push(second_next)
            if(third) stored.push(third)
            if(third_next) stored.push(third_next)
        }

        console.log({
            ran: randomBubbles.length,
            res: reserved.length,
            interestBasedContents: interestBasedContents.length
        });

        res.send({successful: true, cinema: stored})
    } catch(e){
        console.log(e);
        // console.log("failed");
        res.send({successful: false, message: 'upload encountered some errors'})
    }
    
}

module.exports = cinemaServer_v2