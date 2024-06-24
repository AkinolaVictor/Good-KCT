// import { writeFile } from "fs";
const { writeFile } = require("fs");

function socketUpload(models, socket, io){
    // const {chats} = models
    
    socket.on("upload", (file, callback) => {
      console.log(file); // <Buffer 25 50 44 ...>
  
      // save the content to the disk, for example
    //   writeFile("/tmp/upload", file, (err) => {
      writeFile("./filex.jpg", file, (err) => {
        console.log("done");
        callback({ message: err ? "failure" : "success" });
      });
    })
}

module.exports = socketUpload