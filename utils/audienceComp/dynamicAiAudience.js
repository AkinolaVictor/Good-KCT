const eachConditionChecker = require("./eachConditionChecker")
const eachOptionChecker = require("./eachOptionChecker")

async function dynamicAiAudience({options, models, userID, creatorID, content, feed}) {
    const opts = [...options]
    let finalResults = []
    let containsHandpicked = false

    
    for(let i=0; i<opts.length; i++){
        const {value, con} = opts[i]
        const thisData = opts[i]?.data||[]
        const currVal = value.split("-")
        const val = currVal[1]
        if(val==="hnp"){
            if(thisData.includes(userID)){
                if(i==0){
                    containsHandpicked = true
                } else {
                    const currCon = con.split("-")
                    const conNum = currCon[0]
                    const conVal = currCon[1]
                    const conDir = currCon[2]
                    const condition = await eachConditionChecker({feed, dir: conDir, val: conVal, num: conNum, content})
                    if(condition){
                        containsHandpicked = true
                    }
                }
                break
            }
        }
    }

    if(containsHandpicked){
        return {
            subApproved: true
        }
    }

    for(let i=0; i<opts.length; i++){
        const {value, con} = opts[i]
        const currVal = value.split("-")
        const num = currVal[0]||0
        const val = currVal[1]
        const dir = currVal[2]
        if(i==0){
            const result = await eachOptionChecker({num, dir, val, models, userID, content, creatorID, feed})
            finalResults.push(result)
        } else {
            const currCon = con.split("-")
            const conNum = currCon[0]
            const conVal = currCon[1]
            const conDir = currCon[2]
            const condition = await eachConditionChecker({feed, dir: conDir, val: conVal, num: conNum, content})
            if(condition){
                const result = await eachOptionChecker({num, dir, val, models, userID, content, creatorID, feed})
                finalResults.push(result)
            } else {
                finalResults.push(false)
            }
        }
    }

    return {
        subApproved: finalResults.includes(true)
    }
}

module.exports = dynamicAiAudience