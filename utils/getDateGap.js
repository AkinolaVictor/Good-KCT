const date = require('date-and-time')

module.exports = function getDateGap(greater, lesser, which){
    if(!(greater && lesser)){
        return false
    }

    const date1 = new Date(greater)
    const date2 = new Date(lesser)
    let gap = 1
    if(which==="hour"){
        gap = date.subtract(date1, date2).toHours()
    } else if(which==="day"){
        gap = date.subtract(date1, date2).toDays()
    } else {
        gap = date.subtract(date1, date2).toMilliseconds()
    }
    return gap
}