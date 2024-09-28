
async function getCinema(req, res){
    const {cinema, cinemaPair, User, Followers} = req.dbModels

    const ref = req.body.cinemaRef
    const userID = req.body.userID
    

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