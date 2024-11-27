
async function getMostRecurrentInterest({models, userID, unique}) {
    if(!models) return {}
    if(!userID) return {}

    const {userKnowledgebase} = models
    let highestKnowledge = {}
    const maxRange = unique||10
    const userKnowledge = await userKnowledgebase.findOne({userID}).lean()
    if(userKnowledge){
        const {hashTags} = userKnowledge
        const hashArr = Object.keys(hashTags)

        const tracker = []
        for(let i=0; i<hashArr.length; i++){
            const hash = hashArr[i]
            const curr = hashTags[hash]||{}
            let max = Object.keys(curr).length
            const all = [...Object.values(curr), max]
            const newMax = Math.max(...all)
            max=newMax
            const proto = {
                hash,
                count: max
            }

            if(tracker.length >= maxRange){
                for(let j=0; j<tracker.length; j++){
                    const current = tracker[j]
                    if(max>current.count){
                        tracker[j] = proto
                    }
                }
            } else {
                tracker.push(proto)
            }
        }

        for(let i=0; i<tracker.length; i++){
            const hash = tracker[i]?.hash
            if(!hash) continue
            highestKnowledge[hash] = tracker[i].count
        }
    }
    return highestKnowledge
}

module.exports = getMostRecurrentInterest