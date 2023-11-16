const fs = require('fs');
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