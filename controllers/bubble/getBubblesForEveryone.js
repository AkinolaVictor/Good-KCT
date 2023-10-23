// getBubblesForEveryone
const {doc, getDoc, updateDoc, increment} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const bubblesForEveryone = require('../../models/bubblesForEveryone')

async function getBubblesForEveryone(req, res){
    const allPublicBubble = await bubblesForEveryone.findOne({name: "Everyone"}).lean()
    if(allPublicBubble === null){
        const newPublicBubbles = new bubblesForEveryone({name: "Everyone", bubbleRefs: []})
        await newPublicBubbles.save().catch(()=>{})
        res.send({successful: true, bubbleRefs: []})
    } else {
        res.send({successful: true, bubbleRefs: allPublicBubble.bubbleRefs})
    }
}

module.exports = getBubblesForEveryone