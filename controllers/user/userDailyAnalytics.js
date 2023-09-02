const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const date = require('date-and-time')
const {database} = require('../../database/firebase')

async function userDailyAnalytics(req, res){
    const analytics = req.body.data || {}
    const userID = req.body.userID
    const currentDate = req.body.currentDate
    // const currentDate = "name"
    // const dataString = JSON.stringify(data)
    // console.log(currentDate, analytics);
    // remove from audience

    const usageRef = doc(database, 'usageAnalytics', userID)
    await getDoc(usageRef).then(async(docsnap)=>{
        if(docsnap.exists()){
            let analyticsData = {...docsnap.data()}
            // const dataToString = ""
            if(!analyticsData[currentDate]){
                const finalData = [analytics]
                let dataToString = JSON.stringify(finalData)
                analyticsData[currentDate] = dataToString
                // console.log(1, dataToString);
                // await updateDoc(usageRef, {[currentDate]: dataToString}).then((res)=>{console.log('done 2x');}).catch((err)=>{console.log('done3x', err);})
            } else {
                const actualData = [...JSON.parse(analyticsData[currentDate])]
                actualData.push(analytics)
                let dataToString = JSON.stringify(actualData)
                analyticsData[currentDate] = dataToString
                // console.log(2, dataToString);
                // await updateDoc(usageRef, {[currentDate]: dataToString}).then((res)=>{console.log('done 2');}).catch((err)=>{console.log('done3', err);})
            }
            await setDoc(usageRef, {...analyticsData})
            // await updateDoc(usageRef, {[currentDate]: dataToString}).then((res)=>{
            //     console.log('done 2');
            // }).catch((err)=>{
            //     console.log('done3', err);
            // })
        } else{
            const finalData = [analytics]
            const dataToString = JSON.stringify(finalData)
            setDoc(usageRef, {[currentDate]: dataToString})
        } 
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'An error occured from the server side'})
    })
}

module.exports = userDailyAnalytics