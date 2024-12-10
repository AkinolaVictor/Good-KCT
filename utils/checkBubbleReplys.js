const dataType = require("./dataType")

function checkBubbleReplys({thisBubble, userID}){
    if(!thisBubble) return false
    const reply = thisBubble?.reply||[]
    let allFirstSetRepliers = {}

    function worker(reply){
        for(let i=0; i<reply.length; i++){
            const current = reply[i]
            if(dataType(reply[i])=='object'){
                allFirstSetRepliers[current.userID] = true

                if(reply[i].reply.length){
                    worker(reply[i].reply)
                }
            }
        }

        return {
            number: Object.keys(allFirstSetRepliers).length,
            users: {...allFirstSetRepliers}
        }
    }
    
    const checkUser = worker(reply).users
    return checkUser[userID]?true:false
}

module.exports = checkBubbleReplys