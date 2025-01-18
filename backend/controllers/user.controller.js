import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import cloudinary from 'cloudinary';
export const getProfile = async(req,res)=>{
    try{
        const{username} = req.params;
        const user = await User.findOne({username:username})
        if(!user){
            return res.status(404).json({e:'username not found'})
        }
        res.status(200).json(user);

    }catch(e){
        console.log(`Error in get User profile controller :${e}`);
        res.status(500).json({e:'Internal server error'})
    }
}
export const followUnfollowUser = async(req,res)=>{
    try{
        const{_id}=req.params;
        const userToModify = await User.findById({_id:_id});
        const currentUser = await User.findById({_id:req.user._id});
        if(_id == req.user._id.toString()){
            return res.status(400).json({e:'You cannot unfollow or follow yourself'})
        }
        if(!userToModify || !currentUser){
            return res.status(404).json({e:'User not found'})
        }
        const isFollowing = currentUser.following.includes(_id);

        if(isFollowing){
            //unfollow
            await User.findByIdAndUpdate({_id:_id},{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user._id,{$pull:{following:_id}})
            res.status(200).json({message:'Unfollow successfully'});
        }else{
            //follow
            await User.findByIdAndUpdate({_id:_id},{$push:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id},{$push:{following:_id}})

            //send notification
            const newNotification = new Notification({
                type:"follow",
                from:req.user._id,
                to:userToModify._id
            })
            await newNotification.save();
            res.status(200).json({message:'Follow successfully'});
            
        }
        
    }catch(e){
        console.log(`Error in follow and unfollow controller:${e}`);
        res.status(500).json({e:'Internal server error'})
    }
}
export const getSuggestedUsers = async (req,res) => {
    try{
        const userId = req.user._id; //current userId
        const userFollowedByMe = await User.findById({_id:userId}).select('-password');//who following him
        const users = await User.aggregate([
            {
                $match:{
                    _id:{$ne:userId}
                }
            },{
                $sample:{
                    size:10
                }
            }
        ])
        const filteredUser = users.filter(user=>!userFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUser.slice(0,4);
        suggestedUsers.forEach((user)=>(user.password = null)); 
        res.status(200).json(suggestedUsers);
    }catch(e){
        console.log(`Error in getSuggestedUsers controller:${e}`);
        res.status(500).json({e:'Internal server error'})
    }
}
export const updateUser = async(req,res)=>{
    try{
        const userId = req.user._id;
        const {username,fullName,email,currentPassword,newPassword,bio,link}=req.body;
        let{profileImg,coverImg} = req.body;
        let user = await User.findById({_id:userId})
        if(!user){
            return res.status(404).json({e:"user not found"})
        }
        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({e:"please provide both the new password and current password"});
        }
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword,user.password);
            if(!isMatch){
                return res.status(400).json({e:'current password is incorrect'})
            }
            if(newPassword.lenght<6){
                return res.status(400).json({e:'password must have atleast 6 char length'});
            }
            user.password = await bcrypt.hash(newPassword,12);
        }
        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
            } 
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
            } 
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url;
        }
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;
        user = await user.save();
        user.password = null;
        return res.status(200).json(user);

    }catch(e){
        console.log(`Error in updateUser controller:${e}`);
        res.status(500).json({e:'Internal server error'})

    }
}