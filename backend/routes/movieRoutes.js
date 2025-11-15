import express from 'express'
import User from '../models/User'
const router = express.Router(); 

router.post('/saveHistory/:userId', async(req, res)=>{
    const {userId }= req.params; 
        const {
        contentId,
        title,
        platform,
        thumbnailUrl,
        lastWatchPosition,
        totalDuration
    } = req.body;

    try {
        const user = User.findOne({_id: userId}); 
        
        if(!user) return res.status(404).json({message:"User not found"}); 

        let existing = user.viewing_history.find(item=>item.contentId==contentId); 

        if(existing){
            existing.lastWatchPosition = lastWatchPosition; 
            existing.totalDuration = totalDuration; 
            existing.timestamp = new Date().toISOString(); 
        }else{
            user.viewing_history.push({
                contentId,
                title,
                platform,
                thumbnailUrl,
                lastWatchPosition,
                totalDuration,
                timestamp: new Date().toISOString(),
            })
        }

        await user.save(); 
        return res.status(200).json({message: "Watch history saved"}); 

    } catch (error) {
        console.log("Error Occured",error); 
        res.status(500).json({message: "Internal Server Error"}); 

    }
})

router.get("/getWatchHistory/:id",async(req,res)=>{
    const {userId} = req.params; 
    try {
        
   
    const user = await User.findOne({_id: userId}); 

    if(!user) return res.status(404).json({message:"User not found "}); 

    const watchHistory = user.viewing_history; 

    if(!watchHistory) return res.json({message: "Start Watching some movies"}); 

    res.json({message: "Watch history " , watchHistory}); 
     } catch (error) {
        console.log("Error Occured", error); 
        res.status(500).json({message: "Internal Server Error"});    
    }

})

export default router; 