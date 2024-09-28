// const date = require('date-and-time');

function socketCinemaForEveryone(models, socket, io){
    const {cinemaForEveryone} = models
    try{
        const cinemaDoc = cinemaForEveryone.watch([], {fullDocument: "updateLookup"})
        cinemaDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const allDoc = {...data.fullDocument}
                io.emit(`cinema_for_everyone`, {
                    type: "cinema_for_everyone",
                    data: {cinemaRefs: [...allDoc.cinemaRefs]}
                })
            }
        })

    } catch(e){
        console.log("some error from bubbleForEveryone");
        console.log("bubbleForEveryone", e);
    }
}

module.exports = socketCinemaForEveryone