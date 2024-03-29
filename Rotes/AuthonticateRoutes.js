import express, { response } from "express"
import { User } from "../Models/Authentication.js"
import bcrypt  from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import nodemailer from "nodemailer"
import otpgenratore from "otp-generator"

let userOTPmaping= new Map()
dotenv.config()

const router=express.Router()

// otp genrate Routes

router.post("/otpgenrate",async(req,res)=>{
    try {
        let  email = req.body.email;

        const GenrateOTP=await otpgenratore.generate(6,{upperCaseAlphabets:false,lowerCaseAlphabets:false,specialChars:false})

        if(!GenrateOTP){
            return res.status(422).json({msg:"Otp Genratetion Faild"})
        }

        userOTPmaping.set(email,GenrateOTP)

const Transport=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.ADMIN_GMAIL,
        pass:process.env.ADMIN_PASSWORD
    }
});

   const info={
    from: process.env.ADMIN_GMAIL,
    to: email,
    subject: "Recode Book OTP",
    html: `<div>
    <div>
        <h4>Thank You For Intrest In  Our Platform</h4><br/>
        <h2 >Your One Time Password Is  : <span style="fontSize:10vw;color:green; font-weight: 800;">${GenrateOTP}</span></h2>
       
       <br />
       <p>Our Platform To Store Your data Regular in  Secure Way. 😊</p>
    </div>
</div>`,

   };

   Transport.sendMail(info,(error,info)=>{
    if(error){
        return res.status(401).json({msg:"Email Can Not Send.."})
    }
    return res.status(200).json({msg:`Email has been sent Successfully`})
   
   })

   setTimeout(()=>{
    userOTPmaping.delete(email)
   },300000)

    } catch (error) {
    return res.status(401).json({msg:"Internal Server Error While Send  Email..."+ error})
    }
})

// create user

router.post("/sinup",async(req,res)=>{
    let success=false

    try {
        const {name,email,password,otp}=req.body;
        if(!name || !email || !password || !otp){
            return res.status(401).json({msg:"All fields are required"})
        }

        let user=await User.findOne({email: email});
        
        if (user) {
            return res.status(409).json({msg:'User already exists'})
        };

        // otp validation

if(!(userOTPmaping.has(email)&&userOTPmaping.get(email)==otp)){
    return res.status(401).json({msg:"Invalid OTP"})
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

        res.status(201).json({token:tokent,Success:success,msg:"User created successfully!"})

        
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
    res.status(201).json({token:token,Success:success,msg:"Login Success..."})
} catch (error) {
   return res.status(402).json({msg:"server error",err:error})
}

})

// Forgote Password 

router.patch("/forgot",async(req,res)=>{
    let success=false
    try {
        const {email,password,otp}=req.body;

        if(!(email && password  && otp)){
             return res.status(401).json({msg:'Please fill all fields'})
         }
        let user= await User.findOne({email:email});
      
        if(!user){
           return  res.status(404).json({msg:'Email Not Found'})
        }
        
        //get reset token and expire time
        let Salt=await bcrypt.genSalt(10);
        const hashpassword=await bcrypt.hash(password,Salt)

        if(!(userOTPmaping.has(email)&&userOTPmaping.get(email)==otp)){
            return res.status(401).json({msg: "Invalid OTP"})
        }

      let update= await User.findOneAndUpdate({email:email},{$set:{"password":hashpassword}},{new:true})

      if(!update){
        return res.status(401).json({msg:"Password Can Note Change"})
      }

      success=true
      return res.status(200).json({Success:success,msg:"Password Successfully Changed..!"})
 
    } catch (error) {
        return res.status(402).json({msg:"server error while password Change",err:error})
    }
})





export default router




