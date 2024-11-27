module.exports = async function searchPeople({searchText, models}) {
    let data = []
    const {User} = models

    // const users = await User.find({"userInfo.fullname": searchText, "userInfo.username": searchText})
    const users = await User.find({}).lean()
    // console.log({users});
    if(users){
        const resp = [...users]
        for(let i=0; i<resp.length; i++){
            const curr = resp[i]
            const {fullname, username} = curr?.userInfo||{fullname: "", username: ""}
            const fullnameSmall = fullname.toLowerCase()
            const usernameSmall = username.toLowerCase()
            const searchSmall = searchText.toLowerCase()
            const test = usernameSmall.includes(searchSmall) || fullnameSmall.includes(searchSmall)
            if(test){
                data.push(curr)
            }
        }
    }
    
    // logic
    return data
}