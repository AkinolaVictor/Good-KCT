const engagementCondition = require("./engagementCondition")
const periodicCondition = require("./periodicCondition")

async function eachConditionChecker({num, dir, val, feed, content}){
    if(val==="tim"){
        const result = periodicCondition({feed, num, dir})
        return result
    }

    if(val==="eng"){
        const result = engagementCondition({feed, num, dir, content})
        return result
    }

    return false
}

module.exports = eachConditionChecker