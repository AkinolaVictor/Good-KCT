const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function getAllBots(req, res){
    const userBots = req.body.userBots

    try{
        const bots = []
        for(let i=0; i<userBots.length; i++){
            const current = userBots[i]
            const botRef = doc(database, 'bots', current)
            await getDoc(botRef).then((docSnap)=>{
                if(docSnap.exists()){
                    const thisBot = {...docSnap.data()}
                    bots.push(thisBot)
                }
            }).then(()=>{
                if(i===userBots.length-1){
                    res.send({successful: true, bots})
                }
            }).catch(()=>{
                res.send({successful:false})
            })
            
        }
    } catch(e){
        res.send({successful: false, bots: []})
    }
}

module.exports = getAllBots