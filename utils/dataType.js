
function dataType(data){
    if(typeof data === 'object' && data.length===undefined){
        return 'object'
    } else {
        if(typeof data === 'object'){
            return 'array'
        } else {
            return typeof data
        }
    }
}

module.exports = dataType