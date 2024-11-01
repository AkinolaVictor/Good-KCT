

async function deleteInIspace(req, res){
    const {ispace} = req.dbModels
    let {which, userID, id} = req.body

    try{
        const userIspace = await ispace.findOne({userID}).lean()
        
        if(userIspace){
            const selected = [...userIspace[`${which}`]]
            
            for(let i=0; i<selected.length; i++){
                const curr = selected[i]
                if(id === curr?.id){
                    selected.splice(i, 1)
                }
            }

            await ispace.updateOne({userID}, {[`${which}`]: selected})
            res.send({successful: true})
            return
        }
        res.send({successful: false})
    } catch(e){
        console.log(e);
        res.send({successful: false, message: 'Unable to perform action'})
    }
}

module.exports = deleteInIspace