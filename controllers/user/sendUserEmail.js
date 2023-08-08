const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;


async function sendUserEmail(req, res){
    const MY_EMAIL = 'concealed.bubble@gmail.com'
    const RECEIVER_EMAIL = req.body.userEmail||'akinolavictor50@gmail.com'
    const subject = req.body.subject
    const html = req.body.html

    const client_id = process.env.CONCEALED_OAUTH2_EMAIL_CLIENT_ID
    const client_secret = process.env.CONCEALED_OAUTH2_EMAIL_CLIENT_SECRET
    const refresh_token = process.env.CONCEALED_OAUTH2_EMAIL_REFRESH_TOKEN
    // console.log(RECEIVER_EMAIL);
    const createdTransporter = async () => {
        
        const oauth2Client = new OAuth2(client_id, client_secret, "https://developers.google.com/oauthplayground");
      
        oauth2Client.setCredentials({
          refresh_token
        });
      
        const accessToken = oauth2Client.getAccessToken()
        // const accessToken = await new Promise((resolve, reject) => {
        //   oauth2Client.getAccessToken((err, token) => {
        //     if (err) {
        //       console.log('This is an Error');
        //       reject();
        //     }
        //     resolve(token);
        //   });
        // });
      
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: MY_EMAIL,
            accessToken,
            clientId: client_id,
            clientSecret: client_secret,
            refreshToken: refresh_token,
            tls: {
                rejectUnauthorized: false
            }
          }
        });
        return transporter;
    };

    //emailOptions - who sends what to whom
    const sendEmail = async (emailOptions) => {
        let emailTransporter = await createdTransporter();
        await emailTransporter.sendMail(emailOptions)
        // await emailTransporter.sendMail(emailOptions, (error, info)=> {
            // console.log(info);
        //     if(error){
        //         res.send({successful: false, message: 'Sorry, Message not sent!!!'});
        //         // return false;
        //     }else{
        //         res.send({successful: true, message: 'Thank you, Your message has been delivered'});
        //         // return true;
        //     }
        // })
    };

    const emailOptions = {
        from: 'Concealed <concealed.bubble@gmail.com>',
        to: RECEIVER_EMAIL,
        subject,
        html
        // text: "I am sending an email from nodemailer!",
    }

    await sendEmail(emailOptions).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        // console.log('failed to send to email');
        res.send({successful: false})
    })
}

module.exports = sendUserEmail