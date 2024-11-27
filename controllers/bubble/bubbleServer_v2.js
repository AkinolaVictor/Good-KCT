// const Ai_Audience = require("../../utils/AIAudience")
const dataType = require("../../utils/dataType")
const getInterestBasedBubbles = require("../../utils/getInterestBasedBubbles")
const getMostRecurrentInterest = require("../../utils/getMostRecurrentInterest")
const getRandomBubbles = require("../../utils/getRandomBubbles")

async function bubbleServer_v2(req, res){
    const {userID, seen, where, count, location} = req.body
    const models = req.dbModels
    const {bubblesForEveryone, Feeds, Following, userBubbles, bubble,} = models

    try{
        
        let bubbleRefs = []
        if(where==="for all"){
            const generalBubble = await bubblesForEveryone.findOne({name: "Everyone"}).lean()
            const genRefs = [...generalBubble.bubbleRefs].reverse()
            if(generalBubble) bubbleRefs = [...bubbleRefs, ...genRefs]
        }
        
        if(where==="following"){
            const userFeed = await Feeds.findOne({userID}).lean()
            const userFeedRefs = [...userFeed.bubbles].reverse()
            if(userFeed) bubbleRefs=[...bubbleRefs, ...userFeedRefs]
        }
        
        if(where==="aos"){
            const generalBubble = await bubblesForEveryone.findOne({name: "Everyone"}).lean()
            const genRefs = [...generalBubble.bubbleRefs].reverse()
            if(generalBubble) bubbleRefs = [...bubbleRefs, ...genRefs]

            const userFeed = await Feeds.findOne({userID}).lean()
            const userFeedRefs = [...userFeed.bubbles].reverse()
            if(userFeed) bubbleRefs = [...bubbleRefs, ...userFeedRefs]
        }

        let stored = []
        let interestBasedContents = []
        if(where!=="following"){
            const interestsKnowledge = await getMostRecurrentInterest({models, userID, unique: 50})||{}
            interestBasedContents = await getInterestBasedBubbles({models, bubbleRefs, interestsKnowledge, userID, seen, where, count})
        }

        // get for virality by increasing familiarknowledge to 100
        // get random ones
        // if the quantity of both interests and virality is not much, increase the random ones
        const randomBubbles = await getRandomBubbles({models, bubbleRefs, userID, seen, interestBasedContents, count, where})

        // const frontDisplayPattern = []
        for(let i=0; i<count; i+=2){
            const first = dataType(interestBasedContents[i])==="object"?interestBasedContents[i]:null
            const first_next = dataType(interestBasedContents[i+1])==="object"?interestBasedContents[i+1]:null
            const second = dataType(randomBubbles[i])==="object"?randomBubbles[i]:null
            const second_next = dataType(randomBubbles[i+1])==="object"?randomBubbles[i+1]:null
            // const third = dataType(randomBubbles[i])==="object"?randomBubbles[i]:null
            // const third_next = dataType(randomBubbles[i+1])==="object"?randomBubbles[i+1]:null

            if(first) stored.push(first)
            if(first_next) stored.push(first_next)
            if(second) stored.push(second)
            if(second_next) stored.push(second_next)
            // if(third) stored.push(third)
            // if(third_next) stored.push(third_next)
        }

        // stored = [...interestBasedContents]
        res.send({successful: true, bubbles: stored})
    } catch(e){
        console.log(e);
        console.log("some error ");
        res.send({successful: false, message: "some error encountered at the server side"})
    }
}

module.exports = bubbleServer_v2