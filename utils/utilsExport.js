const baseUrl = require("./baseUrl")
const dataType = require("./dataType")
const updateLastActivity = require("./updateLastActivity")


const registered_utilities = {
    dataType,
    updateLastActivity,
    baseUrl
}

module.exports = {...registered_utilities}