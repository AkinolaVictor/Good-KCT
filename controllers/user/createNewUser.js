const {doc, setDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function createNewUser(req, res){
    const userID = req.body.userID // user.id
    // const userData = req.body.userData // user.userInfo.fullname
    const data = req.body.data

    try{
      const userRef = doc(database, "users", userID)
      
      await setDoc(userRef, {...data}).then(async()=>{
          await setDoc(doc(database, "feeds", userID), {bubbles: []})
      }).then(async(result)=>{
        res.send({successful: true})
      }).catch(()=>{
        res.send({successful: false})
      })

    } catch (e){
      res.send({successful: false})
    }
    
}

module.exports = createNewUser