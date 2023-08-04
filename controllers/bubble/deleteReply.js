const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')

async function deleteReply(req, res){
    const bubbleID = req.body.bubbleID
    // const userID = req.body.userID
    const path = req.body.path // props.path

    // remove from audience
    let overallRep = []
    let eachReply = []

    function buildReply(path, reply){
        let pathClone = [...path]
        if (eachReply.id){
            let old = {...eachReply}
            eachReply = {...old.reply[pathClone[0]]}
        }else{
            eachReply = {...reply[pathClone[0]]}
        }
        overallRep.push(eachReply)
        pathClone.shift()
        // recurrsion
        if (pathClone.length!==0) {
            buildReply(pathClone, reply)
        }
    }

    const docz = doc(database, 'bubbles', bubbleID)
    await getDoc(docz).then(async(docsnap)=>{
        // console.log('i ran');
        if(docsnap.exists()){
            let posts = {...docsnap.data()}
            const replys = posts.reply
    
            if (path.length === 1) {
                const subreplys = posts.reply[path[0]].reply
                if(subreplys.length){
                    posts.reply[path[0]].message = '**The content of this reply has been deleted**';
                } else {
                    posts.reply[path[0]] = 'Deleted...';
                }
                const reply = posts.reply
                await updateDoc(docz, {reply})
            }else{
                buildReply(path, replys)
                // destructured replies
                let dR = [...overallRep]
                // let id = dR[path.length-1].id
                let parent = [...dR[path.length-2].reply]
                // delete child
                const subreplys = parent[path[path.length-1]].reply
                if(subreplys.length){
                    parent[path[path.length-1]].message = '**The content of this reply has been deleted**'
                }else{
                    parent[path[path.length-1]] = 'Deleted...'
                }
                dR[path.length-2].reply = parent
                // reversal compilation
                let final;
                if(path.length == 2){
                    final = dR[0]
                }else{
                    // loop through path and create final
                    for(let i=path.length-2; i>0; i=i-1){
                        dR[i-1].reply[path[i]] = dR[i]
                    }
                    final = dR[0]
                }
                posts.reply[path[0]] = final;
                const reply = posts.reply
                await updateDoc(docz, {reply})
            }
        } else {
            res.send({successful: false, message: 'Bubble not found'})
        }
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'An error occured from the server side'})
    })

    
}

module.exports = deleteReply