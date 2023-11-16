const crawlbubblesAnalytics = require("./miscelleneous/crawlbubblesAnalytics")
const formatUserDetails = require("./miscelleneous/formatUserDetails")

async function majorToolsAndFixes(models){
    // formatUserDetails(models)
    crawlbubblesAnalytics(models)
}

module.exports = majorToolsAndFixes