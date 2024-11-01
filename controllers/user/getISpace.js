

async function getIspace(req, res){
    const {ispace} = req.dbModels
    let {userID} = req.body

    try{
        const i_space = await ispace.findOne({userID}).lean()
        
        if(i_space){
            const data = {
                audience: i_space.audience,
                algorithm: i_space.algorithm,
                bot: i_space.bot
            }
            
            res.send({successful: true, ispace: {...data}})
            return
        }
        res.send({successful: false})
    } catch(e){
        res.send({successful: false, message: 'Unable to perform action'})
    }
}

module.exports = getIspace