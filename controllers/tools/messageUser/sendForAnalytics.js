const emailSender = require("../../../utils/emailSender")

async function sendForAnalytics(models){
    const {User, eachUserAnalytics} = models
    const allUsers = await User.find({}).lean()

    for(let i=0; i<allUsers.length; i++){
        const currentUser = allUsers[i]
        const userID = currentUser.id
        const email = currentUser.userInfo.email
        const name = currentUser.userInfo.fullname
        const userAnalytics = await eachUserAnalytics.findOne({userID})
        if(userAnalytics){
            let impressions = 0, likes = 0, replys = 0, shares = 0, bubbleIDs = 0, follows = 0, profileView = 0,
            bubbleUsers=0, profileUsers=0
            const {bubbles, profile} = userAnalytics

            const usersBubbleData = Object.values(bubbles)
            bubbleUsers = usersBubbleData.length
            for(let j=0; j<usersBubbleData.length; j++){
                const curr = usersBubbleData[j]
                impressions+=curr.impressions
                likes+=curr.likes
                replys+=curr.replys
                shares+=curr.shares
                bubbleIDs+=curr.bubbleIDs.length
            }


            const userProfileData = Object.values(profile)
            profileUsers = userProfileData.length
            for(let j=0; j<userProfileData.length; j++){
                const curr = userProfileData[j]
                follows+=curr.follow
                profileView+=curr.views
            }

            const data = {impressions, likes, replys, shares, bubbleIDs, follows, profileView, bubbleUsers, profileUsers}
            console.log(data);

            const payload = {
                email,
                subject: "The Subject",
                html: `
                    <div>
                        <p> Hello ${name}, here is the analytics of how peoplw engaged with your data this week: dec 2 - dec 8</p>
                        <p></p>
                    </div>
                `
            }

            // await emailSender(payload).then(()=>{
            // }).catch(()=>{console.log("Log failure");})
        }
    }
}

module.exports = sendForAnalytics