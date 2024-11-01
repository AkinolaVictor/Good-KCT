
async function knowledgeBuilder({userID, models, which, intent, hash}){
    try {
        const {userKnowledgebase} = models
        const thisUserBase = await userKnowledgebase.findOne({userID}).lean()
        if(thisUserBase){
            if(intent === "hashtags"){
                const hashTags = thisUserBase.hashTags||{}
                for(let i=0; i<hash.length; i++){
                    const curr = hash[i]
                    if(hashTags[curr][which]){
                        hashTags[curr][which]++
                    } else {
                        hashTags[curr][which] = 1
                    }
                    hashTags[curr]["lastdate"] = new Date().toISOString()
                }
                await userKnowledgebase.updateOne({userID}, {hashTags})
            } else if(intent === "kpi"){
                const kpi = thisUserBase.kpi||{}
                // do things here
                await userKnowledgebase.updateOne({userID}, {kpi})
            } else {}
        }
    } catch(e){
        console.log(e);
        console.log("failed to update knowledge");
    }
}

module.exports = knowledgeBuilder
