const Ai_Audience = require("../../utils/AIAudience")

async function getMultipleCinema(req, res){
    const {cinema, cinemaPair, User, userCinema, cinemaFeeds, hashTags, allUser, notifications, Followers, io, cinemaForEveryone} = req.dbModels

    const refs = req.body.cinemaRef
    const userID = req.body.userID
    // console.log(refs);

    
    try {
        const userIDs = {}
        const postIDs = {}
        for(let i=0; i<refs.length; i++){
            const {postID, metaData} = refs[i]
            const creatorID = refs[i].userID
            const {audience} = metaData||{}
            const AiAud = audience?.["Ai Audience"]
            const basicViewEligibity = audience["Everyone"] || audience[userID] || AiAud
            if(basicViewEligibity){
                userIDs[creatorID] = true
                postIDs[postID] = true
            }
        }

        const cinemaObj = {}
        const multipleCinemas = await cinema.find({postID: {$in: [...Object.keys(postIDs)]}}).lean()
        for(let i=0; i<multipleCinemas.length; i++){
            cinemaObj[multipleCinemas[i].postID] = multipleCinemas[i]
        }

        const cinemaPairObj = {}
        const multipleCinemasPair = await cinemaPair.find({postID: {$in: [...Object.keys(postIDs)]}}).lean()
        for(let i=0; i<multipleCinemasPair.length; i++){
            cinemaPairObj[multipleCinemasPair[i].postID] = multipleCinemasPair[i]
        }

        const users = {}
        const cinemaCreator = await User.find({id: {$in: [...Object.keys(userIDs)]}}).lean()
        for(i=0; i<cinemaCreator.length; i++){
            users[cinemaCreator[i].id] = cinemaCreator[i]
        }

        const acquiredFollowers = {}
        const multipleFollowers = await Followers.find({userID: {$in: [...Object.keys(userIDs)]}}).lean()
        for(i=0; i<multipleFollowers.length; i++){
            acquiredFollowers[multipleFollowers[i].userID] = {...multipleFollowers[i].followers}
        }

        async function getEachCinema({thisRef}){
            let thisCinema = cinemaObj[thisRef.postID]
            const thisCinemaPair = cinemaPairObj[thisRef.postID]
            if(thisCinema && thisCinemaPair){
            // if(thisCinema){
                let creatorInfo = users[thisRef.userID]
                if(!creatorInfo){
                    creatorInfo = await User.findOne({id: thisRef.userID}).lean()
                }
                if(!creatorInfo) return null
                
                thisCinema.username = creatorInfo.userInfo.username
                thisCinema.fullname = creatorInfo.userInfo.fullname
                thisCinema.photo = creatorInfo.profilePhotoUrl

                const clipData = thisCinema.data
                for(let i=0; i<clipData.length; i++){
                    const curr = clipData[i]
                    const AiAud = curr?.audience?.["Ai Audience"]
                    if(AiAud){
                        const {approved} = await Ai_Audience({
                            userID,
                            models: req.dbModels,
                            audienceData: AiAud,
                            content: "clip",
                            feed: thisRef
                        })

                        if(clipData.length===1){
                            if(approved){
                                thisCinema.data[i].approved = approved
                            } else {
                                res.send({successful: false})
                                return
                            }
                        } else {
                            thisCinema.data[i].approved = approved
                        }
                    }
                }
                
                let creatorFollowers = acquiredFollowers[thisRef.userID]?.followers
                if(!creatorFollowers){
                    const creatorFollowersData = await Followers.findOne({userID: thisRef.userID}).lean()
                    if(creatorFollowersData) creatorFollowers = creatorFollowersData.followers
                }
                
                const isFollower = (creatorFollowers[userID] || thisRef.userID===userID)?true:false
                thisCinema.isFollower = isFollower
                thisCinema.feedRef = thisRef
                thisCinema = {...thisCinema, ...thisCinemaPair}
                
                
                return thisCinema
            }
            
            return null
        }

        const preparedCinema = []
        for(let i=0; i<refs.length; i++){
            const thisRef = refs[i]
            const thisCinema = await getEachCinema({thisRef})
            if(thisCinema) {
                preparedCinema.push(thisCinema)
            }
        }

        res.send({successful: true, cinema: preparedCinema})
    } catch (e) {
        console.log(e);
        console.log("failed");
        res.send({successful: false, message: 'upload encountered some errors'})
    }
}

module.exports = getMultipleCinema