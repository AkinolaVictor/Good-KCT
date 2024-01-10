async function sendFeatureUpdates(models){
    const {User} = models
    const userbase = await User.find({}).lean()
    // const 
    // for
}

module.exports = sendFeatureUpdates