const { default: axios } = require("axios")
const { baseUrl } = require("../../utils/utilsExport");
const bubblesForEveryone = require("../../models/bubblesForEveryone");

async function copyBubblesForEveryone(){
    await axios.post(baseUrl("bubble/getBubblesForEveryone")).then(async(response)=>{
        if(response.data.successful){
            const bubbleRefs = response.data.bubbleRefs
            const bbFAll = await bubblesForEveryone.findOne({name: "Everyone"})
            if(bbFAll === null){
                const newBBFAll = new bubblesForEveryone({name: "Everyone", bubbleRefs})
                await newBBFAll.save().then(()=>{
                    console.log("completed");
                }).catch(()=>{
                    console.log("failed");
                })
            } else {
                await bubblesForEveryone.updateOne({name: "Everyone"}, {bubbleRefs}).then(()=>{
                    console.log("completed");
                }).catch(()=>{
                    console.log("failed");
                })
            }
        }
    }).catch(()=>{
        console.log("failed attempt");
    })
}

module.exports = copyBubblesForEveryone