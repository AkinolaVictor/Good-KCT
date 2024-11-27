const eachConditionChecker = require("./eachConditionChecker")
const eachOptionChecker = require("./eachOptionChecker")

async function progressiveAiAudience({models, options, userID, content, feed}) {
    const opts = [...options]
    let subApproved = false
    
    // function checkHandpickedHere(index){
    //     let containsHandpicked = false
    //     let includesHnp = false
    //     let thisIndex = null
    //     for(let i=0; i<opts.length; i++){
    //         const {value, con} = opts[i]
    //         const thisData = opts[i]?.data||[]
    //         const currVal = value.split("-")
    //         const val = currVal[1]
    //         if(val==="hnp"){
    //             includesHnp = true
    //             if(thisData.includes(userID)){
    //                 containsHandpicked = true
    //                 index = i
    //                 if(i==0){
    //                 } else {
    //                     // const currCon = con.split("-")
    //                     // const conNum = currCon[0]
    //                     // const conVal = currCon[1]
    //                     // const conDir = currCon[2]
    //                     // const condition = await eachConditionChecker({feed, dir: conDir, val: conVal, num: conNum, content})
    //                     // if(condition){
    //                     //     containsHandpicked = true
    //                     // }
    //                 }
    //                 break
    //             }
    //         }
    //     }
    //     let skip = false
    //     if(thisIndex!==null){
    //         if(index>=thisIndex){
    //             skip = true
    //         }
    //     }
    //     return {
    //         includesHnp,
    //         pass: containsHandpicked,
    //         skip
    //     }
    // }

    for(let i=0; i<opts.length; i++){
        const {value, con} = opts[i]
        const currVal = value.split("-")
        const num = currVal[0]||0
        const val = currVal[1]
        const dir = currVal[2]

        if(subApproved) break

        if(i==0){
            const result = await eachOptionChecker({num, dir, val, models, userID, content, creatorID, feed})
            subApproved = result
            if(result) break
        } else {
            const currCon = con.split("-")
            const conNum = currCon[0]
            const conVal = currCon[1]
            const conDir = currCon[2]
            // const {pass, includesHnp, skip} = checkHandpickedHere(i)
            const condition = await eachConditionChecker({feed, dir: conDir, val: conVal, num: conNum, content})
            const result = await eachOptionChecker({num, dir, val, models, userID, content, creatorID, feed})
            const finalResult = condition && result
            subApproved = finalResult
            if(finalResult) break
        }
    }

    return {
        subApproved
    }
}

module.exports = progressiveAiAudience