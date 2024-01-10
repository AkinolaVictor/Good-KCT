const sendForAnalytics = require("./sendForAnalytics");
const sendUpdateProfile = require("./sendUpdateProfile");

async function allMessageUser(models){
    // console.log(models);
    // sendUpdateProfile(models)
    sendForAnalytics(models)
}

module.exports = allMessageUser