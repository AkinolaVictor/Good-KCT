const express = require('express')
const multer = require('multer')
const router = express.Router()


  const storage = multer.diskStorage({
    destination: function (req, file, cb){
    //   return cb(null, "public/images/")
      return cb(null, "upload/")
    },
    filename: function (req, file, cb){
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
    
  const upload = multer({storage})
  
module.exports = router