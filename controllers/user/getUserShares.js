const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function getUserShares(req, res){
    let userID = req.body.userID

    try{
        const bubblesRef = doc(database, 'userShares', userID)
        await getDoc(bubblesRef).then((docs)=>{
            if(docs.exists()){
                const bubbles = [...docs.data().bubbles]
                res.send({successful: true, bubbles})
            } else {
                res.send({successful: false, message: 'bubbles not found'})
            }
        }).catch(()=>{
            res.send({successful: false, message: 'Server error: bubbles not found'})

        })
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to get bubbles'})
    }
}

module.exports = getUserShares