async function crawlbubblesAnalytics (models){
    const {bubble} = models
    const allBubbles = await bubble.find({}).lean()
    const data = {
        total_bubbles: allBubbles.length
    }
    const userCount = {}
    
    for(let i=0; i< allBubbles.length; i++){
        const thisBubble = allBubbles[i]

        // User count
        const u_count = userCount[thisBubble.user.id]||0
        userCount[thisBubble.user.id] = u_count + 1


    }

    // update_count
    data.unique_user = Object.keys(userCount).length

    console
    .log(
        data,
        userCount
    );
}

module.exports = crawlbubblesAnalytics