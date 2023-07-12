const date = require('date-and-time')


function updateLastActivity(thisPost, activity, updateFunc){
    function getDate(){
        const now = new Date()
        const time = date.format(now, 'h:mm:ssA')
        const when = date.format(now, 'DD/MM/YYYY')
        const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
        return {
            time,
            date: when,
            dateString
        }
    }

    if(!thisPost.activities.lastActivities){
        thisPost.activities.lastActivities=[]
    }

    const lastActivities = thisPost.activities.lastActivities
    const activityData = {
        activity,
        userID: userID,
        date: getDate()
    }
    if(lastActivities.length>0){
        const last = lastActivities[lastActivities.length - 1]
        if(last.activity!==activity){
            for(let i=0; i<lastActivities.length; i++){
                const current = lastActivities[i]
                if(current.userID===userID && current.activity===activity){
                    break
                }
                if(i===lastActivities.length-1){
                    thisPost.activities.lastActivities.push(activityData)
                    if(thisPost.activities.lastActivities.length>5){
                        thisPost.activities.lastActivities.shift()
                    }
                    updateFunc()
                }
            }
        }
    } else {
        thisPost.activities.lastActivities.push(activityData)
        updateFunc()
    }
}


module.exports = updateLastActivity