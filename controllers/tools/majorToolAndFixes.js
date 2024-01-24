const crawlbubblesAnalytics = require("./miscelleneous/crawlbubblesAnalytics")
const formatUserDetails = require("./miscelleneous/formatUserDetails")
const populateAllUser = require("./miscelleneous/populateAllUser")

async function majorToolsAndFixes(models){
    // formatUserDetails(models)
    populateAllUser(models)
    // crawlbubblesAnalytics(models)
}

module.exports = majorToolsAndFixes