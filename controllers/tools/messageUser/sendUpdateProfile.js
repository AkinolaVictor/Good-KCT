const emailSender = require("../../../utils/emailSender");

async function sendUpdateProfile(models){
    const {User, userBubbles} = models
    const userbase = await User.find({}).lean()
    let forUserName = [], 
        forAbout = [], 
        forBubble = [], 
        forAboutAndUsername = [], 
        forBubbleAndAbout = [], 
        forBubbleAndUsername = [], 
        forAll = [] ;

    for(let i=0; i<userbase.length; i++){
        const currentUser = userbase[i]
        const userID = currentUser.id
        const userPhoto = currentUser.profilePhotoUrl
        const userBubble = await userBubbles.findOne({userID}).lean()

        const {about, email, username, fullname} = currentUser.userInfo
        const ifAbout = about.length
        const ifPhoto = userPhoto.length>2
        const ifUserName = username.length>3
        const ifBubbles = userBubble?userBubble.bubbles.length:false
        const ifAny = !ifPhoto || !ifUserName || !ifAbout

        const payload = {
            email,
            subject: 'Concealed: Ensure to setup your account',
            html: `
                <div>
                    <p>Hello, ${fullname}</p>
                    <p>We discovered that you are yet to personalize your profile on concealed since you joined.</p>
                    ${
                        !ifPhoto && !ifUserName && !ifAbout?
                        "<p>We encourage you to update your profile: upload a profile photo, add a username, and update your bio</p>":
                        !ifUserName && !ifAbout?
                        "<p>We encourage you to update your profile: add a username, and update your bio</p>":
                        !ifPhoto && !ifAbout?
                        "<p>We encourage you to update your profile: upload a profile photo, and update your bio</p>":
                        !ifPhoto && !ifUserName?
                        "<p>We encourage you to update your profile: upload a profile photo and add a username.</p>":
                        !ifUserName?
                        "<p>We encourage you to update your profile and add a username.</p>":
                        !ifAbout?
                        "<p>We encourage you to update your profile and update your bio</p>":
                        !ifPhoto?
                        "<p>We encourage you to update your profile and upload a profile photo</p>":
                        ""
                    }

                    ${
                        !ifBubbles && ifAny?
                        "<p>We encourage you to also create contents about any area of your interest, and explore contents that have been created by others</p>":
                        !ifBubbles?
                        "<p>We encourage you to create contents about any area of your interest, and explore contents that have been created by others</p>":
                        ""
                    }

                    <p>This will influence your visibility, help you to get more followers and also let you attract like-minded people.</p>
                    <p>We would ensure to continually keep you updated on your interests, for any enquires, you can reach out to us through our email at concealed.bubble@gmail.com</p>
                    <p>Thank you</p>
                </div>
            `
        }

        // console.log(payload.html);
        if(ifAny || !ifBubbles){
            console.log(fullname);
            // await emailSender(payload).then(()=>{
            //     // console.log(payload.html);
            //     console.log(email);
            // }).catch(()=>{console.log("failed to send message to user");})
        }
        const num = ((i+1)/userbase.length)*100
        const message = `${num}% completed`
        console.log(message);
    }
}

module.exports = sendUpdateProfile