const { default: axios } = require("axios")
const baseUrl = require("../../utils/baseUrl")
const bubble = require("../../models/bubble")

async function copyBubbles(){
    axios.post(baseUrl("bubble/getAllBubbles")).then(async(response)=>{
        // console.log(response.data);
        if(response.data.successful){
            const bubbles = [...response.data.bubbles]
            console.log(bubbles.length);
            for(let i=0; i<bubbles.length; i++){
                const num = i+1
                const progress = (num/bubbles.length)*100
                const thisBubble = {...bubbles[i]}
                if(typeof(thisBubble.activities) === "object"){
                    const activities = JSON.stringify(thisBubble.activities)
                    thisBubble.activities = activities
                }
                
                if(typeof(thisBubble.shareStructure) === "object"){
                    const shareStructure = JSON.stringify(thisBubble.shareStructure)
                    thisBubble.shareStructure = shareStructure
                }
                
                if(typeof(thisBubble.reply) === "object"){
                    const reply = JSON.stringify(thisBubble.reply)
                    thisBubble.reply = reply
                }
                if(thisBubble.createdAt){
                    delete thisBubble.createdAt
                }
                if(thisBubble.updatedAt){
                    delete thisBubble.updatedAt
                }
                // console.log(`${progress}% completed`);
                const bubb = await bubble.findOne({postID: thisBubble.postID})
                if(bubb === null){
                    const newBubble = new bubble({...thisBubble})
                    await newBubble.save().then(()=>{
                        console.log(`${progress}% new completed`);
                    }).catch((err)=>{
                        console.log(err);
                        console.log(`${progress}% new failed`);
                    })
                } else {
                    await bubble.updateOne({postID: thisBubble.postID}, {...thisBubble}).then(()=>{
                        console.log(`${progress}% completed`);
                    }).catch(()=>{
                        console.log(`${progress}% failed`);
                    })
                }
            }
            console.log("All bubbles copied");
        }
    }).catch((err)=>{
        console.log(err);
        console.log("failed");
    })
}

module.exports = copyBubbles