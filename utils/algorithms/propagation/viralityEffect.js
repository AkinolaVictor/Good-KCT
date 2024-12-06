async function viralityEffect({models, userID, feedRef, contentType, algorithm}) {
    const {reservedContents, Followers, userKnowledgebase, User} = models
    const {postID, metaData} = feedRef
    const allHash = metaData?.hash||{}
    const hashArr = Object.keys(allHash)
    const {topics, location, rate, gend} = algorithm||{topics: [], location: [], rate: "s"}
    const algorithmTopics = topics||[]
    const {loc} = feedRef?.metaData||{}
    const genda = feedRef?.metaData?.gend
    // const creatorID = feedRef.userID
    
    function getRate(){
        if(rate==="s") return 0.05
        if(rate==="m") return 0.1
        if(rate==="h") return 0.3
        return 0.05
    }
    
    const userFollowers = await Followers.findOne({userID}).lean()
    if(userFollowers){
        const fflw = Object.keys(userFollowers.followers)
        for(let i=0; i<fflw.length; i++){
            const current = fflw[i]
            
            if(genda || loc){
                const thisUser = await User.findOne({id: current}).lean()
                if(!thisUser) continue
                const {userInfo} = thisUser
                const {gender} = userInfo
                const userLocation = userInfo?.location
    
                const thisGender = gender==="male"?"m":gender==="female"?"f":"a"
                if(gend !== "a"){
                    const checkGender = thisGender === gend
                    if(!checkGender) continue
                }
    
                if(location.length){
                    if(!userLocation) continue
                    const loc = userLocation?.country?.toLowerCase()
                    const gotLoc = location.includes(loc)
                    if(!gotLoc) continue
                }
            }

            const aboutThisUser = await userKnowledgebase.findOne({userID: current}).lean()
            if(!aboutThisUser) continue
            const hashs = aboutThisUser?.hashTags||{}
            for(let j=0; j<hashArr.length; j++){
                const curr = hashArr[j]
                const thisHash = hashs[curr]
                const passAlgoHash = algorithmTopics.includes(curr)
                let userPass = false
                if(thisHash || passAlgoHash){
                    const {impression, reply, like, share} = thisHash
                    let passEquation = false
                    const maxVal = Math.max(reply, like, share)||0
                    const engRate = maxVal/impression||1
                    const rateCheck = engRate >= getRate()
                    passEquation = rateCheck
                    if(passEquation){
                        userPass = true
                    }
                }

                if(userPass){
                    let reservedForAlgorithm = null
                    let newReservedForAlgorithm = false
                    reservedForAlgorithm = await reservedContents.findOne({userID: current}).lean()
                    if(!reservedForAlgorithm){
                        newReservedForAlgorithm = true
                
                        reservedForAlgorithm = {
                            bubbles: [],
                            cinema: [],
                            userID: current,
                        }
                    }

                    const discernWhich = contentType === "clip"?"cinema":"bubbles"
                    const thisData = reservedForAlgorithm[discernWhich]||[]
                    let isContained = false
                    for(let k=0; k<thisData.length; k++){
                        const curx = thisData[i]
                        if(typeof curx !== "object") continue
                        const thisPostID = curx?.postID
                        if(thisPostID===postID){
                            isContained = true
                            break
                        }
                    }

                    if(isContained) break
                    
                    reservedForAlgorithm[discernWhich].push(feedRef)

                    if(newReservedForAlgorithm){
                        const createCon = new reservedContents({...reservedForAlgorithm})
                        await createCon.save()
                    } else {
                        await reservedContents.updateOne({userID: current}, {[`${discernWhich}`]: reservedForAlgorithm[discernWhich]})
                    }

                    break
                }
            }
        }
    }
}

module.exports = viralityEffect