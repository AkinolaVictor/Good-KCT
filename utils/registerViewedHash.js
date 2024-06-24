async function registerViewedHashs(eachUserAnalytics, thisBubble, userID){
    const feedRef = thisBubble.feedRef?thisBubble.feedRef:null
    let hash = []
    if(feedRef){
        const {metaData} = feedRef
        if(metaData){
            const hashs = metaData.hash||{}
            hash = [...Object.keys(hashs)]
        }
    }

    if(hash){
        if(hash.length){
            const hashData = {}
            for(let i=0; i<hash.length; i++){
                hashData[hash[i]] = 1
            }

            const userAnalytics = await eachUserAnalytics.findOne({userID}).lean()
            if(userAnalytics === null){
                const data = {
                    userID,
                    bubbles: {}, 
                    profile: {},
                    viewedHashs: {...hashData}
                    // date: {...getDate()}
                }
                const newUserAnalytics = new eachUserAnalytics({...data})
                await newUserAnalytics.save()
            } else {
                const {viewedHashs} = userAnalytics
                if(viewedHashs){
                    for(let i=0; i<hash.length; i++){
                        if(viewedHashs[hash[i]]){
                            viewedHashs[hash[i]]++
                        } else {
                            viewedHashs[hash[i]] = 1
                        }
                    }
                    await eachUserAnalytics.updateOne({userID}, {viewedHashs})
                } else {
                    await eachUserAnalytics.updateOne({userID}, {viewedHashs: {...hashData}})
                }
            }
            // console.log("completed");
        }
    }
}

module.exports = registerViewedHashs