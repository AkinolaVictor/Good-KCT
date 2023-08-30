const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const date = require('date-and-time')
const {database} = require('../../database/firebase')

async function userDailyAnalytics(req, res){
    const data = req.body.data || '{}'
    const userID = req.body.userID
    const currentDate = req.body.currentDate
    // const dataString = JSON.stringify(data)
    // console.log(currentDate, data);
    // remove from audience
    const usageRef = doc(database, 'usageAnalytics', userID)
    await getDoc(usageRef).then(async(docsnap)=>{
        if(docsnap.exists()){
            const data = {...docsnap.data()}
            data[currentDate] = data
            await updateDoc(usageRef, {...data})
        } else{
            setDoc(usageRef, {[currentDate]: data})
        } 
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'An error occured from the server side'})
    })
}

module.exports = userDailyAnalytics