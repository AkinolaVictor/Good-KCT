async function editUserSettings(req, res){
    const {User} = req.dbModels
    const userID = req.body.userID
    const newSettings = req.body.settings

    const thisUser = await User.findOne({id: userID}).lean()
    if(thisUser){
        if(!thisUser.settings){
            const settings = {
                audience: { value: "Everyone", data: {} },
                profile: { value: "Everyone", data: {} },
                bubbles: { value: "Everyone", data: {} },
                people: { value: "Everyone", data: {} },
                secrecy: { value: "Everyone", data: {} },
                ...newSettings
            }
            await User.findOneAndUpdate({id: userID}, {settings}).then(()=>{
                res.send({successful: true, settings: newSettings})
            }).catch(()=>{
                res.send({successful: false, settings: null})
            })
        } else {
            const refinedSettings = {...thisUser.settings, ...newSettings}
            await User.findOneAndUpdate({id: userID}, {settings: refinedSettings}).then(()=>{
                res.send({successful: true, settings: newSettings})
            }).catch(()=>{
                res.send({successful: false, settings: null})
            })
        }
    }

    // const thisSettings = await userSettings.findOne({userID})
    // if(thisSettings === null){
    //     const createSettings = new userSettings({
    //         userID, 
    //         settings: {
    //             audience: { value: "Everyone", data: {} },
    //             profile: { value: "Everyone", data: {} },
    //             bubbles: { value: "Everyone", data: {} },
    //             people: { value: "Everyone", data: {} },
    //             secrecy: { value: "Everyone", data: {} },
    //             ...newSettings
    //         }
    //     })
    //     await createSettings.save().then(()=>{
    //         res.send({successful: true, settings: newSettings})
    //     }).catch(()=>{
    //         res.send({successful: false, settings: null})
    //     })
    // } else {
    //     const refinedSettings = {...thisSettings.settings, ...newSettings}
    //     await userSettings.findOneAndUpdate({userID}, {settings: refinedSettings}).then(()=>{
    //         res.send({successful: true, settings: newSettings})
    //     }).catch(()=>{
    //         res.send({successful: false, settings: null})
    //     })
    // }
}

module.exports = editUserSettings