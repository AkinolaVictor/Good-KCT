const Ai_Audience = require("../../AIAudience")

module.exports = async function searchClip({searchText, models, userID}) {
    let data = []
    const {cinema} = models
    
    const bubs = await cinema.find({}).lean()
    if(bubs){
        const resp = [...bubs]
        for(let i=0; i<resp.length; i++){
            const curr = resp[i]
            const searchSmall = searchText.toLowerCase()
            const feedRef = curr.feedRef
            
            const {metaData} = feedRef||{}
            const audience = metaData?.audience||{}
            
            const basicViewEligibity = audience["Everyone"] || audience[userID] || Object.keys(audience).length===0
            
            const aiAud = audience["Ai Audience"]
            const aiAud2 = audience["Ai Audience"]||{}
            const audArr = Object.values(aiAud2)
            if(aiAud && !basicViewEligibity){
                let confirm = true
                for(let i=0; i<audArr.length; i++){
                    const each = audArr[i]
                    const {approved} = await Ai_Audience({
                        userID,
                        models: models,
                        audienceData: each,
                        content: "clip",
                        feed: feedRef
                    })
                    if(approved){
                        confirm = false
                        break
                    }
                }
                if(confirm){
                    continue
                }
            }

            if(!(aiAud || basicViewEligibity)) continue

            const bub = curr.data
            for(let j=0; j<bub.length; j++){
                const thisBub = bub[j]
                const audc = thisBub.audience
                const passaudc = audc["Everyone"] || audc["Ai Audience"] || audc[userID]
                if(!passaudc) continue

                const message = thisBub?.caption||""
                const lowmessage = message.toLowerCase()
                if(lowmessage.includes(searchSmall)){
                    data.push(feedRef)
                    break
                }
            }
        }
    }
    
    
    return [...data.reverse()]
}