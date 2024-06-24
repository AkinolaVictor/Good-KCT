const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
// const userLikes = require("../../models/LikeModel");
const date = require('date-and-time');

function watchUserLikesStream(models, socket, io){
    const userLikes = models.LikeModel
    try{
        const userLikesDoc = userLikes.watch([], {fullDocument: "updateLookup"})
        userLikesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')
                const userID = data.fullDocument.userID
                // const userLikesRef = doc(database, 'userLikes', data.fullDocument.userID)
                const bubbles = {...data.fullDocument}
                
                bubbles.formattedDate = formattedDate
                bubbles._id && delete bubbles._id
                // await setDoc(userLikesRef, {...bubbles}).catch(()=>{})

                // io.emit(`userLikes-${userID}`, {
                //     type: "likes",
                //     data: {likes: [...bubbles.bubbles]}
                // })
            }
        })
        
    } catch(e){
    }
}

module.exports = watchUserLikesStream