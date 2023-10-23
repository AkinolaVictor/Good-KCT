const {doc, getDoc, updateDoc, setDoc, increment} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const { v4: uuidv4 } = require('uuid')
const date = require('date-and-time')
const {database} = require('../../database/firebase')
const { default: sizeof } = require('firestore-size')
const bubble = require('../../models/bubble')

async function dislikeReply(req, res){
    const bubbleID = req.body.bubbleID
    const userID = req.body.userID
    const path = req.body.path // path
    
    // remove from audience
    let overallRep = []
    let eachReply = []

    function buildReply(path, reply){
        let pathClone = [...path]
        if (eachReply.id){
            let old = {...eachReply}
            eachReply = {...old.reply[pathClone[0]]}
        }else{
            eachReply = {...reply[pathClone[0]]}
        }
        overallRep.push(eachReply)
        pathClone.shift()
        // recurrsion
        if (pathClone.length!==0) {
            buildReply(pathClone, reply)
        }
    }

    try {
        const thisBubble = await bubble.findOne({postID: bubbleID}).lean()
        if(thisBubble === null){
            res.send({successful: false, message: 'Bubble not found'})
        } else {
            let replys = thisBubble.reply
            if(typeof(replys) === "string"){
                replys = JSON.parse(thisBubble.reply)
            }
            buildReply(path, replys)
            // destructured replies
            let dR = [...overallRep]
                
            if(dR[dR.length-1].like.includes(userID)){
                const arr = dR[dR.length-1].like
                const index = arr.indexOf(userID)
                arr.splice(index, 1)
                let final;
                // loop through path and create final
                for(let i=path.length-1; i>0; i=i-1){
                    dR[i-1].reply[path[i]] = dR[i]
                }
                final = dR[0]
                replys[path[0]] = final;
    
                const reply = JSON.stringify(replys)
                // const totalLikes = thisBubble.totalLikes + 1
                await bubble.updateOne({postID: bubbleID}, {reply})
            }
            res.send({successful: true})
        }
    } catch(e){
        res.send({successful: false, message: 'An error occured from the server side'})
    }
}

module.exports = dislikeReply