import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const Auth= (req,res,next)=>{
    const Authtoken= req.header("token")

    if(!Authtoken){
        return res.status(402).json({msg:"User  is not logged in!"})
    }
    const data=jwt.verify(Authtoken,process.env.JWT_SECRET)

    req.user=data.user

    next()
}

export default Auth