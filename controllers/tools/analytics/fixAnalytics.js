async function fixAnalytics(model) {
    const {usageAnalytics} = model
    const analytics = await usageAnalytics.find({})
    for(let i=0; i<analytics.length; i++){
    // for(let i=0; i<=2; i++){
        const userID = analytics[i].userID

        const thisUserAnalytics = await usageAnalytics.findOne({userID})
        if(thisUserAnalytics){
            const thisCurrentAnalytics = analytics[i].analytics
            const currentAnalyticsArr = Object.keys(thisCurrentAnalytics)
            
            for(let j=0; j<currentAnalyticsArr.length; j++){
                const currentAnalytics = thisCurrentAnalytics[currentAnalyticsArr[j]]
                if(typeof currentAnalytics === "string"){
                    thisCurrentAnalytics[currentAnalyticsArr[j]] = JSON.parse(currentAnalytics)
                }
            }
            await usageAnalytics.updateOne({userID}, {analytics: thisCurrentAnalytics})
        }
        const progress = ((i+1)/analytics.length)*100
        console.log(`${progress}% completed for ${userID}`);
    }
}

module.exports = fixAnalytics