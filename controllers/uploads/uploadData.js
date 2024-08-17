const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { storage } = require("../../database/firebase");
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');

module.exports = async function uploadData(req, res){
    if(!req.file) return
    const file = req.file

    const {originalname, filename, path} = file
    const userID = originalname
    // console.log({filename});
    file.originalname = uuidv4()
    try{
        // const thisFile = require(`../../uploads/${filename}`)
        // const thisFile = require(`${path}`)
        // const thisFile = await import(`../../uploads/${filename}`).then((dat)=>{console.log(dat);})
        // console.log(thisFile);
        // return
        // fs.readFile(`../../uploads/${filename}`, (err, data) => {
        //     if (err) {
        //     //   console.error(err);
        //       console.log(err);
        //       return;
        //     }
        //     // console.log(data.toString());
        //     console.log({data});
        // });
    } catch(e){
        console.log(e);
        console.log("ddkk");
    }
    // console.log(file);
    // res.send({})
    // return

    try {
        const imageFileRef = ref(storage, `users/${userID}/profile/${"fromServer"}`) 
        await uploadBytes(imageFileRef, file).then((snapshot)=>{
            getDownloadURL(snapshot.ref).then(async(url)=>{
                console.log(url);
                res.send({successful: true, url})
            }).catch(()=>{
                res.send({successful: false})
            })
        }).catch(()=>{
            res.send({successful: false})
        })
    } catch (e){
        console.log(e);
        console.log("un-uploaded");
        res.send({successful: false})
    }
    

}