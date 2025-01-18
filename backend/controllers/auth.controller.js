import User from '../models/user.model.js'
import bcrypt from 'bcrypt'
import generateToken from '../utils/generateToken.js'; 

export const signup = async(req,res)=>{
    try{
        const {username,fullName,email,password} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email))
        {
            return res.status(400).json({error:"Invalid email format"});
        }

        const existingEmail = await User.findOne({email:email});
        const existingUsername = await User.findOne({username:username});

        if(existingEmail || existingUsername){
            return res.status(400).json({error:"Already existing user or email"})
        }
        if(password.length<6){
            return res.status(400).json({error:"Password must have atleast 6 char length"})
        } 
        const hash = await bcrypt.hash(password,12)
        const newUser = await User.create({email:email,fullName:fullName,username:username,password:hash})

        if(newUser){
            generateToken({_id:newUser._id},res)
            await newUser.save();
            // res.status(200).json({message:'User registered successfully'})
            res.status(200).json({
                _id:newUser._id,
                username:newUser.username,
                fullName:newUser.fullName,
                email:newUser.email,
                followers:newUser.followers,
                following:newUser.following,
                profileImg:newUser.profileImg,
                coverImg:newUser.coverImg,
                bio:newUser.bio,
                link:newUser.link,
            })
        }else{
            res.status(400).json({error:"Invalid user data"});
        }

    }catch(e){
        console.log(`Error in Signup controller${e}`)
        res.status(500).json({e:'Internal Server Error'})
    }
}
export const login = async(req,res)=>{
    try{
        const{username,password} = req.body;
        const user = await User.findOne({username:username});
        const isPwrdCrct = await bcrypt.compare(password,user?.password ||'');
        if(!user || !isPwrdCrct){
            return res.status(400).json({e:"Invalid username or password"})
        }
        generateToken({_id:user._id},res);
        res.status(200).json({
            _id:user._id,
            username:user.username,
            fullName:user.fullName,
            email:user.email,
            followers:user.followers,
            following:user.following,
            profileImg:user.profileImg,
            coverImg:user.coverImg,
            bio:user.bio,
            link:user.link,})

    }catch(e){
        console.log(`Error in login controller: ${e}`);
        res.status(500).json({e:"Internal server error"})
    }
}
export const logout = async(req,res)=>{
    try{
        res.cookie('jwt','',{maxAge:0})
        res.status(200).json({message:'Logout Successfully'})
    }
    catch(e){
        console.log(`Error in logout controller: ${e}`);
        res.status(500).json({e:"Internal server error"})
    }
}
export const getMe = async(req,res)=>{
    try{
       const user = await User.findOne({_id:req.user._id}).select("-password");
       res.status(200).json(user);
    }
    catch(e){
        console.log(`Error in getMe controller: ${e}`);
        res.status(500).json({e:"Internal server error"})
    }
} 