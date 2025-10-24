const express = require('express'); 

const router = express.Router(); 

router.post('/register',async (req,res)=>{
    const {name, username , password} = req.body(); 

    try {
      
    } catch (e) {
     console.log("An Error occured ") 
    }
})
router.post('/login',async (req,res)=>{
    const {name, username , password} = req.body(); 

    try {
      
    } catch (e) {
     console.log("An Error occured ") 
    }
})
