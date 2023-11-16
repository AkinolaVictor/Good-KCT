const fs = require('fs');

async function getAllAnalytics(model){
    const {usageAnalytics} = model
    const analytics = await usageAnalytics.find({})

    for(let i=0; i<analytics.length; i++){
    // for(let i=0; i<=0; i++){
        const thisAnalytics = analytics[i].analytics
        const analyticsArr = Object.keys(thisAnalytics)
        // const userID = analytics[i].userID
        // console.log(userID);
        for(let j=0; j<analyticsArr.length; j++){
            const currentAnalytics = thisAnalytics[analyticsArr[j]]
            if(typeof currentAnalytics === "string"){
                // thisAnalytics[analyticsArr[j]] = JSON.parse(currentAnalytics)
                analytics[i].analytics[analyticsArr[j]] = JSON.parse(currentAnalytics)
            }
        }
    }
    // const data = JSON.stringify(analytics).
    // console.log(analytics);

    
    let build = ""
    for(let i=0; i<analytics.length; i++){
        const pre_data = {}
        const thisAnalytics = analytics[i]
        const anal = Object.keys(thisAnalytics.analytics)

        pre_data.userID = thisAnalytics.userID

        for(let j=0; j<anal.length; j++){
            const analData = thisAnalytics.analytics[anal[j]]
            pre_data[[anal[j]]] =  `${JSON.stringify({[anal[j]]: analData})} \n`
            // pre_data[[anal[j]]] =  `${JSON.stringify({[anal[j]]: analData})} \n`
        }

        build = build + `${JSON.stringify(pre_data)} \n\n`
    }

    fs.appendFile("analytics.txt", build, (err)=>{
        console.log(err);
    })
    return analytics
}

module.exports = getAllAnalytics