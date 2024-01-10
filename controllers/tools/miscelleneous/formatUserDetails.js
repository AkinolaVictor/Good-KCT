const fs = require('fs');
const emailSender = require('../../../utils/emailSender');
async function formatUserDetails(models){
    try {
        const {User} = models
        const users = await User.find({}).lean()
        let data = []
        for(let i=0; i<users.length; i++){
            const thisUser = {}
            thisUser.name = users[i].userInfo.fullname
            thisUser.email = users[i].userInfo.email
            // thisUser.phoneNo = users[i].userInfo.phoneNo
            // thisUser.userID = users[i].id
            data.push(thisUser)
            const payload = {
                email: thisUser.email,
                subject: "Concealed Beta Launch Exit",
                html: `
                    <div>
                        <p> Hello ${thisUser.name}!</p>
                        <p>Seasons greetings to you and yours! </p>
                        <p>We hope this festive season brings you peace and hapiness, and may the new year ahead be filled with prosperity and success. </p>
                        <p>Over a period of 4 months, we've been on a beta launch of our product Concealed. </p>
                        <p>Our Goals when we started was to test for bugs and get some traction. We were able to get that done during this time frame, and we couldn't have done that without you, your support is a driving force for our progress so far. </p>
                        <p>We're glad to inform you that we are getting out of this beta launch by December 31, and into a public launch of our product. The date for the public launch would be announced to you soon. We thank you for your support thus far. May your holiday season be magical and your new year be filled with endless possibilities. </p>
                        <p>For any enquiry, you can reach out to our support team through our email address. (concealed.bubble@gmail.com)</p>
                        <p>Warm WIshes, The Concealed Team. </p>

                    </div>
                `
            }
            // if(i===4){
                // await emailSender(payload).then(()=>{
                //     const num = ((i+1)/users.length) * 100
                //     console.log(`${i}) progress ==> ${num}`);
                // }).catch(()=>{console.log("Log failure");})
            // }
        }
        
        let build = ""
        for(let i=0; i<data.length; i++){
            const thisDetail = `${JSON.stringify(data[i])} \n`
            build = build + thisDetail
        }

        fs.appendFile("user_details.txt", build, (e)=>{
            console.log(e);
        })
    } catch(e){
        console.log("Error found", e);
    }
}

module.exports = formatUserDetails