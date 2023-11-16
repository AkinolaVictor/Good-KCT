const fixAnalytics = require("./fixAnalytics");
const getAllAnalytics = require("./getAllAnalytics");

async function analytics_playground(model){
    getAllAnalytics(model)
    // fixAnalytics(model)
}

module.exports = analytics_playground