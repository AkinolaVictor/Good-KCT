function clipReplyCounter({allReplys, initialReplys}){
    const initRep = [...initialReplys]
    let replyCount = initRep.length
    function counter(parents){
        if(!parents.length) return
        const parentClone = [...parents]
        for(let i=0; i<parentClone.length; i++){
          if(allReplys[parentClone[i]]){
            const each = allReplys[parentClone[i]].childReplys
            replyCount+=each.length
            if(each.length){
                counter(each)
            }
          }
        }
    }
    
    counter(initRep)
    return replyCount
}

module.exports = clipReplyCounter