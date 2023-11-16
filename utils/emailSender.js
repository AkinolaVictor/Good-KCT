const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// console.log({client_id, client_secret, refresh_token});

async function emailSender(payload){
    const MY_EMAIL = 'concealed.bubble@gmail.com'
    const RECEIVER_EMAIL = payload.email||'akinolavictor50@gmail.com'
    const subject = payload.subject
    const html = payload.html
    
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
    };

    const emailOptions = {
        from: 'Concealed <concealed.bubble@gmail.com>',
        to: RECEIVER_EMAIL,
        subject,
        html
        // text: "I am sending an email from nodemailer!",
    }


    let returnValue = false
    await sendEmail(emailOptions).then(()=>{
        returnValue = true
    }).catch(()=>{
        returnValue = false
    })

    return returnValue
}

module.exports = emailSender