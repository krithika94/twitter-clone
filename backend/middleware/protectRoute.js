import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
const protectRoute = async(req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        if(!token){
            return res.status(400).json({error:"Unauthorised : No token provided"})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(400).json({error:"Unauthorised : Invalid token"})
        }
        //  // Ensure `decoded.userId` is a valid ObjectId
        //  const userId = typeof decoded.userId === 'string' ? decoded.userId : decoded.userId.userId;
        //  if (!mongoose.Types.ObjectId.isValid(userId)) {
        //      return res.status(400).json({ error: "Unauthorized, invalid user ID" });
        //  }
        const user = await User.findOne({_id:decoded._id}).select("-password");// it dont bring password from mongodb
        if(!user){
            return res.status(400).json({error:"User not found"})
        }
        req.user=user;
        next();
    }catch(e){
        console.log(`Error in protectRoute middleware : ${e}`);
        res.status(500).json({e:"Internal server error"})
    }
}
export default protectRoute;