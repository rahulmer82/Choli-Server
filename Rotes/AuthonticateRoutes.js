import express, { response } from "express"
import { User } from "../Models/Authentication.js"
import bcrypt  from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
const router=express.Router()

// create user

router.post("/sinup",async(req,res)=>{
    let success=false

    try {
        const {name,email,password}=req.body;
        if(!name || !email || !password ){
            return res.status(401).json({msg:"All fields are required"})
        }

        let user=await User.findOne({email: email});
        
        if (user) {
            return res.status(409).json({msg:'User already exists'})
        }
        const salt=await bcrypt.genSalt(10);
        const seccpass=await bcrypt.hash(password,salt)

        //create user

        user=await User.create({
            name:name,
            email:email,
            password:seccpass
        })

        const data={
            user:{
                id:user.id
            }
        }

        const tokent =jwt.sign(data,process.env.JWT_SECRET)

        success=true

        res.status(201).json({token:tokent,Success:success})

        
    } catch (error) {
        res.status(402).json({msg:"server error",err:error})
    }
})


// Now Login to user Routes;

router.post( '/login', async (req,res)=>{
let success=false;

try {
    const {email,password}= req.body;
     
    if( !email || !password ) {
        return res.status(401).json({ msg: 'input fild Cant Not Empty' ,Success:success});
    }

    let Userfind=await User.findOne({email:email})

    

    if(!Userfind){
        return res.status(401).json({msg:"User not found",Success:success});
    }
    const isMatch=await bcrypt.compare(password,Userfind.password);

    if(!isMatch){
        return res.status(401).json({msg:"Invalid Password Please Enter a Currect Password"})
    }

  

    const data={
        user:{
            id:Userfind.id,
        }
    }

    const token=jwt.sign(data,process.env.JWT_SECRET)
   
    success=true
    res.status(201).json({token:token,Success:success})
} catch (error) {
    res.status(402).json({msg:"server error",err:error})
}

})







export default router