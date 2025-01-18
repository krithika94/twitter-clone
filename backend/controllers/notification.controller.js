import Notification from "../models/notification.model.js";

export const getNotifications = async(req,res)=>{
    try{
        const userId = req.user._id;
        const notification = await Notification.find({to:userId})
        .populate({
            path:'from',
            select:'username profile'
        });
        await Notification.updateMany({to:userId},{read:true});
        res.status(200).json(notification);
    }catch(e){
        console.log(`Error : get notifications controller error ${e}`);
        res.status(500).json({e:"Internal server error"});
    }
}
export const deleteNotifications = async(req,res)=>{
    try{
        const userId = req.user._id;
        await Notification.deleteMany({to:userId});
        res.status(200).json({message:'Notification deleted successfully'});
    }catch(e){
        console.log(`Error : delete notifications controller error ${e}`);
        res.status(500).json({e:"Internal server error"});
    }
}