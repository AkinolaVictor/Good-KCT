const emailSender = require("../../utils/emailSender")

async function addNewWaiter(req, res){
    const {waitlist} = req.dbModels
    
    const name = req.body.name
    const email = req.body.email
    const where = req.body.where
    const subject = req.body.subject
    const html = req.body.html

    const waiter = await waitlist.findOne({email})
    // if(waiter === null){
    if(true){
        const newWaiter = new waitlist({name, email, where})
        await newWaiter.save().then(async()=>{
            // send email
            const payload = {email, subject, html}
            await emailSender(payload).then(()=>{
                res.send({successful: "completed"})
            }).catch(()=>{
                res.send({successful: "incomplete"})
            })
        }).catch(()=>{
            res.send({successful: "failed"})
        })
    } else {
        res.send({successful: "user already exists"})
    }
}

module.exports = addNewWaiter