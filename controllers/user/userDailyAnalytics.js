// const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const date = require('date-and-time')
// const {database} = require('../../database/firebase')
// const usageAnalyticsModel = require('../../models/usageAnalytics')

async function userDailyAnalytics(req, res){
    const usageAnalyticsModel = req.dbModels.usageAnalytics
    
    const analytics = req.body.data || {}
    const userID = req.body.userID
    const currentDate = req.body.currentDate


    try{
        const usage = await usageAnalyticsModel.findOne({userID})
        if(usage === null){
            const finalData = [analytics]
            const dataToString = JSON.stringify(finalData)
            const newUsage = new usageAnalyticsModel({userID, analytics: {[currentDate]: dataToString}})
            await newUsage.save()
        } else {
            if(!usage.analytics[currentDate]){
                const finalData = [analytics]
                let dataToString = JSON.stringify(finalData)
                usage.analytics[currentDate] = dataToString
            } else {
                const actualData = [...JSON.parse(usage.analytics[currentDate])]
                actualData.push(analytics)
                let dataToString = JSON.stringify(actualData)
                usage.analytics[currentDate] = dataToString
            }
            const analytics = usage.analytics
            // await usage.save()
            await usageAnalyticsModel.updateOne({userID}, {analytics})
        }
        res.send({successful: true})
    } catch(e){
        res.send({successful: false, message: 'An error occured from the server side'})
    }
}

module.exports = userDailyAnalytics