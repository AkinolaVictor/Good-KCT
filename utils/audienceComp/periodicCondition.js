const getDateGap = require("../getDateGap")

function periodicCondition({feed, num, dir}) {
    try{
        const now = new Date().toISOString()
        const {createdDate} = feed?.metaData
        const days = dir==="hr"?1:7
        let dateGap = (getDateGap(now, createdDate, "day") * days)||0
        const expt = Number(num)||0
        const result = dateGap >= expt
        return result
    } catch(e) {
        console.log(e);
        return false
    }
}

module.exports = periodicCondition