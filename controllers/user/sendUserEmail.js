const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;


async function sendUserEmail(req, res){
    const MY_EMAIL = 'concealed.bubble@gmail.com'
    const RECEIVER_EMAIL = req.body.userEmail||'akinolavictor50@gmail.com'
    const subject = req.body.subject
    const html = req.body.html
    // console.log(RECEIVER_EMAIL);
    const createdTransporter = async () => {
        
        const oauth2Client = new OAuth2(
          process.env.OAUTH2_EMAIL_CLIENT_ID,
          process.env.OAUTH2_EMAIL_CLIENT_SECRET,
          "https://developers.google.com/oauthplayground"
        );
      
        oauth2Client.setCredentials({
          refresh_token: process.env.OAUTH2_EMAIL_REFRESH_TOKEN
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
            clientId: process.env.OAUTH2_EMAIL_CLIENT_ID,
            clientSecret: process.env.OAUTH2_EMAIL_CLIENT_SECRET,
            refreshToken: process.env.OAUTH2_EMAIL_REFRESH_TOKEN,
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
        //     // console.log(info);
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
        // text: "I am sending an email from nodemailer!",
        html
    }

    await sendEmail(emailOptions).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        console.log('failed to send to email');
        res.send({successful: false})
    })
}

module.exports = sendUserEmail