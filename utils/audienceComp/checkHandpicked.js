module.exports = async function checkHandpicked({current, userID}){
    const data = current?.data||[]
    if(data.includes(userID)){
        return true
    }
    return false
}