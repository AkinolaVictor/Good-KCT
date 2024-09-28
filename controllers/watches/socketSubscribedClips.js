// const date = require('date-and-time');

function socketSubscribedClips(models, socket, io){
    const {cinema, cinemaPair} = models
    try{
        const cinemaDoc = cinema.watch([], {fullDocument: "updateLookup"})
        cinemaDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const allDoc = {...data.fullDocument}
                allDoc.fullname && delete allDoc.fullname
                allDoc.username && delete allDoc.username
                allDoc.photo && delete allDoc.photo

                io.emit(`subscribed_clips-${allDoc.postID}`, {
                    clipID: `${allDoc.postID}`,
                    data: {...allDoc}
                })
            }
        })

        const cinemaPairDoc = cinemaPair.watch([], {fullDocument: "updateLookup"})
        cinemaPairDoc.on("change", async(data)=>{
            if(data.fullDocument){

                const allDoc = {...data.fullDocument}
                io.emit(`subscribed_clips_pair-${allDoc.postID}`, {
                    clipID: `${allDoc.postID}`,
                    data: {...allDoc}
                })
            }
        })

    } catch(e){
        console.log("some error from bubbleForEveryone");
        console.log("bubbleForEveryone", e);
    }
}

module.exports = socketSubscribedClips