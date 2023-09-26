// getBubblesForEveryone
const {doc, getDoc, updateDoc, increment} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function getBubblesForEveryone(req, res){
    const userID = req.body.userID // user.id


    const bubblesForEveryoneRef = doc(database, 'bubblesForEveryone', 'Everyone')
    await getDoc(bubblesForEveryoneRef).then(async(docsnap)=>{
        let bubbleRefs = []
        if(docsnap.exists()){
            const thisData = [...docsnap.data().bubbleRefs]
            // For future reference, use the USERID to filter result
            bubbleRefs = thisData
        }
        return bubbleRefs
    }).then((bubbleRefs)=>{
        res.send({successful: true, bubbleRefs})
    }).catch(()=>{
        res.send({successful: false, message: 'Error from the server'})
    })
}

module.exports = getBubblesForEveryone