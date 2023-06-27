const {doc, setDoc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function createBot(req, res){
    const bot = req.body.bot
    const userID = req.body.userID
    const id = req.body.id
    await setDoc(doc(database, "bots", id), {...bot}).then(async()=>{
        const userRef = doc(database, 'users', userID)
        await getDoc(userRef).then(async(snapShot)=>{
            const data = {...snapShot.data()}
            const bots = [...data.bots]
            if(!bots.includes(id)){
                bots.push(id)
                await updateDoc(userRef, {bots})
            }
            
            // setup activity if it doesn't exist
            const botActivityRef = doc(database, 'botActivities', userID)
            await getDoc(botActivityRef).then(async (docsnap)=>{
                if(!docsnap.exists()){
                    setDoc(botActivityRef, {
                        otherBotActivities: [],
                        userBotActivities: []
                    })
                }
            })
            res.send({successful: true})
        }).catch(()=>{
            res.send({successful: false})
        })
    }).catch(()=>{
        res.send({successful: false})
    })
}

module.exports = createBot