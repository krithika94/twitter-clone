
import jwt from 'jsonwebtoken'

const generateToken = (_id,res)=>{
    const token = jwt.sign(_id,process.env.JWT_SECRET,{
        expiresIn:"15D"
    });
    res.cookie("jwt",token,{
        maxAge:15*24*60*1000,
        httpOnly:true,//xss attacks prevent 
        sameSite:"strict",//CSRF attacks
        secure:process.env.NODE_ENV!=="development"

    })

}
export default generateToken;