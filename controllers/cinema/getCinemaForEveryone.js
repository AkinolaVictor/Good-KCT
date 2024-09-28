// const {doc, getDoc, updateDoc, increment} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const bubblesForEveryone = require('../../models/bubblesForEveryone')

async function getCinemaForEveryone(req, res){
    const {cinemaForEveryone} = req.dbModels

    try {
        const allPublicCinema = await cinemaForEveryone.findOne({name: "Everyone"}).lean()
        if(allPublicCinema === null){
            const newPublicCinema = new cinemaForEveryone({name: "Everyone", cinemaRefs: []})
            await newPublicCinema.save().catch(()=>{})
            res.send({successful: true, cinemaRefs: []})
        } else {
            res.send({successful: true, cinemaRefs: allPublicCinema.cinemaRefs})
        }
    } catch(e){
        console.log(e);
        console.log("failed ");
        res.send({successful: false, cinemaRefs: []})
    }
}

module.exports = getCinemaForEveryone