// const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const dateMod = require('date-and-time')
// const {database} = require('../../database/firebase')
// const usageAnalyticsModel = require('../../models/usageAnalytics')

async function userDailyAnalytics2(req, res){
    const usageAnalyticsModel = req.dbModels.usageAnalytics2
    const {User} = req.dbModels
    
    // const newAnalytics = req.body.data || {}
    const userID = req.body.userID
    const startup = req.body.startup
    const data = req.body.data
    const date = req.body.date
    
    if(startup){
        data.loginCount = 1
    }

    function getDateGap(previous){
        const prev = [...previous.split(',')]
        prev[1]--
        const previousDay = new Date(...prev)
        let now = new Date()
        return dateMod.subtract(now, previousDay).toDays()
    }

    function convertDayToString(day){
        const actualDate = day.split(", ")[1].split(" ")
        const actualTime = day.split(", ")[1].split(" ")[3].split(":")
        const dayString = `${actualDate[2]},${monthMap[actualDate[1]]},${actualDate[0]},${actualTime[0]},${actualTime[1]},${actualTime[2]}`  //YYYY,MM,DD,HH,mm,ss 
        return dayString
    }

    // const users = await User.find({}).lean()
    // if(users){
    //     for(let i=0; i<users.length; i++){
    //     // for(let i=0; i<2; i++){
    //         const curr = users[i]
    //         const dateJoined = curr.userInfo.dateJoined
    //         const string = convertDayToString(dateJoined)
    //         const gap = getDateGap(string)
    //         console.log(gap);
    //     }
    // }

    try{
        const users = await User.find({}).lean()
        let userCount = 0
        if(users){userCount = users.length}
        const usage = await usageAnalyticsModel.findOne({date})
        if(usage === null){
            const newUsage = new usageAnalyticsModel({
                date,
                data: {[userID]: data},
                mau: {value: 1, doubleVisits: "", moreVisits: ""},
                totalUsers: userCount,
                growthRate: "",     // "12%"
                retention: "",      // "12%"
                avgTime: "0",    // 10 minutes
            })
            await newUsage.save()
        } else {
            const curr = usage.data[userID]
            if(curr){
                usage.data[userID].createdBubbles = curr.createdBubbles + data.createdBubbles
                usage.data[userID].likes = curr.likes + data.likes
                usage.data[userID].openReply = curr.openReply + data.openReply
                usage.data[userID].openAnalytics = curr.openAnalytics + data.openAnalytics
                usage.data[userID].replys = curr.replys + data.replys
                usage.data[userID].shares = curr.shares + data.shares
                usage.data[userID].impressions = curr.impressions + data.impressions
                usage.data[userID].follow = curr.follow + data.follow
                usage.data[userID].totalTimeSpent = curr.totalTimeSpent + 1
                usage.data[userID].userID = userID
                
                if(!usage.data[userID].name){
                    usage.data[userID].name = data.name
                }

                if(curr.highestSession < data.highestSession){
                    usage.data[userID].highestSession = data.highestSession
                }

                // login count of eact user
                if(startup){
                    usage.data[userID].loginCount = curr.loginCount + 1
                }

                // monthly active users
                usage.mau = {value: Object.keys(usage.data).length, doubleVisits: "", moreVisits: ""}

                // total users
                usage.totalUsers = userCount?userCount:usage.totalUsers

                // average time spent
                let totalTime = 0
                let doubleLogins = 0
                let moreLogins = 0
                const dataSet = Object.values(usage.data)
                for(let i=0; i<dataSet.length; i++){
                    const current = dataSet[i]
                    if(current.totalTimeSpent){
                        totalTime = totalTime + current.totalTimeSpent
                    }
                    if(current.loginCount === 2){
                        doubleLogins++
                    }
                    if(current.loginCount > 2){
                        moreLogins++
                    }
                }
                const avg = totalTime/dataSet.length

                usage.totalTime = totalTime
                usage.avgTime = avg

                usage.mau.doubleVisits = doubleLogins
                usage.mau.moreVisits = moreLogins

                // await usageAnalyticsModel.updateOne({date}, {
                //     data: usage.data, 
                //     avgTime: usage.avgTime,
                //     mau: usage.mau,
                //     totalUsers: usage.totalUsers,
                //     totalTime: usage.totalTime
                // })

            } else {
                usage.data[userID] = data

                // monthly active users
                usage.mau = {value: Object.keys(usage.data).length, doubleVisits: "", moreVisits: ""}

                // total users
                usage.totalUsers = userCount?userCount:usage.totalUsers
                

                // average time spent
                let totalTime = 0
                let doubleLogins = 0
                let moreLogins = 0
                const dataSet = Object.values(usage.data)
                for(let i=0; i<dataSet.length; i++){
                    const current = dataSet[i]
                    if(current.totalTimeSpent){
                        totalTime = totalTime + current.totalTimeSpent
                    }
                    if(current.loginCount === 2){
                        doubleLogins++
                    }
                    if(current.loginCount > 2){
                        moreLogins++
                    }
                }
                const avg = totalTime/dataSet.length

                usage.totalTime = totalTime
                usage.avgTime = avg

                usage.mau.doubleVisits = doubleLogins
                usage.mau.moreVisits = moreLogins

            }

            await usageAnalyticsModel.updateOne({date}, {
                data: usage.data, 
                avgTime: usage.avgTime,
                mau: usage.mau,
                totalUsers: usage.totalUsers,
                totalTime: usage.totalTime
            })   
        }
        // console.log("success");
        res.send({successful: true})
    } catch(e){
        console.log(e);
        res.send({successful: false, message: 'An error occured from the server side'})
    }
}

module.exports = userDailyAnalytics2