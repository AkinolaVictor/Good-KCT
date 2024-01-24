

async function populateAllUser(models){
    try{
        const {User, allUser} = models
        const users = await User.find({}).lean()
        // const allUsers = await allUser.findOne({name: "concealed"}).lean()
        const usersBuild = {}
        for(let i=0; i<users.length; i++){
            const currentUser = users[i]
            usersBuild[currentUser.id] = {
                userID: currentUser.id,
                fullname: currentUser.userInfo.fullname,
                username: currentUser.userInfo.username
            }
        }
        await allUser.updateOne({name: "concealed"}, {users: usersBuild})
        console.log("done");
    } catch(e){
        console.log(e);
    }
}

module.exports = populateAllUser