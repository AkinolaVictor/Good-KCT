const emailSender = require("../../utils/emailSender")

async function addNewWaiter(req, res){
    const {waitlist} = req.dbModels
    
    const name = req.body.name
    const email = req.body.email
    const where = req.body.where
    const subject = req.body.subject
    const html = req.body.html
    const purpose = req.body.purpose

    const waiter = await waitlist.findOne({email})
    if(waiter === null){
        const newWaiter = new waitlist({name, email, where, purpose})
        await newWaiter.save().then(async()=>{
            // send email
            const payload = {email, subject, html, purpose}
            await emailSender(payload).then(()=>{
                res.send({successful: "completed"})
            }).catch(()=>{
                res.send({successful: "unsent"})
            })
        }).catch(()=>{
            res.send({successful: "failed"})
        })
    } else {
        if(purpose === "invitation"){
            // send email
            const payload = {email, subject, html, purpose}
            await emailSender(payload).then(()=>{
                res.send({successful: "completed"})
            }).catch(()=>{
                res.send({successful: "unsent"})
            })
        } else {
            res.send({successful: "user already exists"})
        }
    }
}

module.exports = addNewWaiter