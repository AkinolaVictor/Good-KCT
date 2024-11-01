
async function createInIspace(req, res){
    const {ispace} = req.dbModels
    let {data, which, userID} = req.body
    // console.log({data});
    // console.log({which});
    // console.log({userID});
    // res.send({successful: true})
    // return
    try{
        const userIspace = await ispace.findOne({userID}).lean()
        if(userIspace){
            const selected = [...userIspace?.[`${which}`]]
            selected.push(data)
            await ispace.updateOne({userID}, {[`${which}`]: selected})
            res.send({successful: true})
        } else {
            const selected = {
                audience: [],
                algotithm: [],
                bot: [],
                userID
            }

            selected[`${which}`].push(data)
            const newSpace = new ispace({...selected})
            await newSpace.save()
            res.send({successful: true})
        }
    } catch(e){
        console.log(e);
        res.send({successful: false, message: 'Server error: unable to get bubbles'})
    }
}

module.exports = createInIspace