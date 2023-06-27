const express = require('express')
const router = express.Router()

router.get('/user/test', async (req, res)=>{
    // alert('Testing things')
    console.log('Testing Things');
})

module.exports = router