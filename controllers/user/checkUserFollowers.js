async function checkUserFollowers(req, res){
    const {Followers} = req.dbModels
    const userID = req.body.userID
    const hostID = req.body.hostID
    const userFollowers = await Followers.findOne({userID: hostID}).lean()
    if(!userFollowers){
        res.send({successful: false})
    } else {
        if(userFollowers.followers[userID]){
            res.send({successful: true})
        } else {
            res.send({successful: false})
        }
    }
}

module.exports = checkUserFollowers