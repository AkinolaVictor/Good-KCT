async function openUserProfile_ForAnalytics(req, res){
    const {eachUserAnalytics} = req.dbModels


    const userID = req.body.userID // user.id
    const thisUserID = req.body.thisUserID // props.data.id
    if(userID === thisUserID){
        res.send({done: false})
        return
    }

    const userAnalytics = await eachUserAnalytics.findOne({userID: thisUserID}).lean()
    if(userAnalytics === null){
        const data = {
            userID: thisUserID,
            bubbles: {
                [userID]: {
                    impressions: 0, replys: 0, likes: 0, shares: 0,
                    bubbleIDs: []
                }
            }, 
            profile: {
                [userID]: {follow: 0, views: 1}
            },
            date: {}
            // date: {...getDate()}
        }

        const newUserAnalytics = new eachUserAnalytics({...data})
        await newUserAnalytics.save()
    } else {
        const {profile} = userAnalytics
        if(!profile[userID]){
            profile[userID] = {
                follow: 0,
                views: 1
            }
        } else {
            profile[userID].views++
        }
        await eachUserAnalytics.updateOne({userID: thisUserID}, {profile})
    }
    res.send({done: true})
}

module.exports = openUserProfile_ForAnalytics