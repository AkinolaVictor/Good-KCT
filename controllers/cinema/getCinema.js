
async function getCinema(req, res){
    const {cinema, cinemaPair, User, Followers} = req.dbModels

    const ref = req.body.cinemaRef
    const userID = req.body.userID
    
    
    function check_for_viewCount(thisClip){

        const allFirstSetRepliers = {}

        function allWhoShare(){
            return thisClip.allShares.includes(userID)
        }

        function firstRepliersAll(){
            
            const repArr = Object.values({...thisClip?.allReplys})
            for(let i=0; i<repArr.length; i++){
                const curr = repArr[i]
                if(curr.userID === userID){
                    return true
                }
            }
            return false
        }

        const viewCountSettings = thisClip.settings.secrecyData.viewCount
        if(viewCountSettings){
            const {count, data, value} = viewCountSettings
            const userActivities = thisBubble.activities.iAmOnTheseFeeds[userID]
            const likeCheck = thisBubble.like.includes(userID)
            // console.log(value, count, data);

            if(userActivities){
                const userImpression = userActivities.myImpressions||0
                if(value === "As many as possible"){
                    return false
                } else if(value === "Let me specify for everyone"){
                    // console.log( userImpression);
                    if(userImpression < count || thisBubble.user.id===userID){
                        return false
                    } else {
                        return true
                    }
                } else if(value === "Let me specify for selected few"){
                    if(data[userID]){
                        if((userImpression < count) || thisBubble.user.id===userID){
                            return false
                        } else {
                            return true
                        }
                    } else {
                        return false
                    }
                } else if(value === "Let me specify a few exceptions"){
                    if(data[userID] || thisBubble.user.id===userID){
                        return false
                    } else {
                        if((userImpression < count) || thisBubble.user.id===userID){
                            return false
                        } else {
                            return true
                        }
                    }
                } else if(value === "Specify for non-engaged audience"){
                    if(likeCheck || allWhoShare(userActivities) || firstRepliersAll(thisBubble.reply)){
                        return false
                    } else {
                        if((userImpression < count) || thisBubble.user.id===userID){
                            return false
                        } else {
                            return true
                        }
                    }
                } else {
                    return true
                }
            } else {
                // return true
                return false
            }
        } else {
            return false
        }
    }

    try {
        const {postID, metaData} = ref||{}
        const {audience} = metaData
        const basicViewEligibity = audience["Everyone"] || audience[userID]
        if(basicViewEligibity){
            let thisCinema = await cinema.findOne({postID}).lean()
            const thisCinemaPair = await cinemaPair.findOne({postID}).lean()
            if(thisCinema && thisCinemaPair){
                const creatorInfo = await User.findOne({id: ref.userID}).lean()
                if(creatorInfo){
                    thisCinema.username = creatorInfo.userInfo.username
                    thisCinema.fullname = creatorInfo.userInfo.fullname
                    thisCinema.photo = creatorInfo.profilePhotoUrl
                }

                const creatorFollowers = await Followers.findOne({userID: ref.userID}).lean()
                if(creatorFollowers){
                    const followers = creatorFollowers.followers
                    if(followers[userID] || ref.userID===userID){
                        thisCinema.isFollower = true
                    }
                }
                thisCinema.feedRef = ref
                thisCinema = {...thisCinema, ...thisCinemaPair}
                res.send({successful: true, cinema: {...thisCinema}})
            } else {
                res.send({successful: false})
            }
        } else {
            res.send({successful: false})
        }
    } catch (e) {
        console.log(e);
        console.log("failed");
        res.send({successful: false, message: 'upload encountered some errors'})
    }
}

module.exports = getCinema