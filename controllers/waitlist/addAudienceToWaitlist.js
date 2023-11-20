const emailSender = require("../../utils/emailSender")

async function addAudienceToWaitlist(req, res){
    const {waitlist} = req.dbModels
    const name = req.body.name
    const email = req.body.email
    const subject = req.body.subject
    const html = req.body.html

    const waiter = await waitlist.findOne({email})
    if(waiter === null){
        const newWaiter = new waitlist({name, email})
        await newWaiter.save().then(async()=>{
            // send email
            const payload = {email, subject, html}
            // const payload = {
            //     email,
            //     subject: 'Concealed Launch',
            //     html: `
            //         <div>
            //             <h4>Welcome to Concealed, ${name}</h4>
            //             <p>Thank you for joining the waitlist for the launch of our product (Concealed).</p>
            //             <p>Concealed is scheduled to take off on the 7th of January 2024, we would ensure to reach out to you through this email address, for further updates.</p>
            //         </div>
            //     `
            // }
            await emailSender(payload).then(()=>{
                res.send({successful: "completed"})
            }).catch(()=>{
                res.send({successful: "incomplete"})
            })
        }).catch(()=>{
            res.send({successful: "failed"})
        })
    } else {
        res.send({successful: "user duplicated"})
    }
}

module.exports = addAudienceToWaitlist