import express from "express";
import { Booking } from "../Models/BookinsModel.js";
import { Product } from "../Models/Procut.js";
import mongoose from "mongoose";
import Auth from "../Midelware/Auth.js"
const router = express.Router();

router.post('/adduser',Auth,async(req,res)=>{
    let success=false

    try {
        const {name,number,id,date,note}=req.body;
        if(!( name && number && id)){
            return res.status(401).json({msg:"All Filds Required..!",Success:success})
        };
const FindProduct=await Product.find({user:req.user.id})

const FindProductID=FindProduct.map((item)=> item.productID==id)

if(FindProductID.indexOf(true)=== -1){
    return res.status(401).json({msg:"This Product Id Invalid Or Does Not Exist..!"})
}
         // default date add
        
         const d = new Date();
         let today=d.getDate();
         let month=d.getMonth()+1;
         let year=d.getFullYear()

const dateshow= `${today}/${month}/${year}`;
const part=dateshow.split('/')
const strDate= `${part[0].padStart(2,'0')}/${part[1].padStart(2,'0')}/${part[2]}`

     let finalDate=date||strDate

        //Checking the user is already exist or not  

        const UserBookingData=await Booking.find({user:req.user.id})
       

const data=UserBookingData.filter((value)=>{return value.BookID == id})

        // const findID=await Booking.find({BookID:id});
        
        const existDate=data.map((data) => data.date == finalDate );
        const TrueIndex=existDate.indexOf(true); 
        
       if(!(TrueIndex=== -1)){
        return  res.status(422).json({msg:"This date has been booked by another User",Success:success})
       }

       // 
        // check rents

        const rentID=await Product.findOne({productID:id}).select('rent name');
       
        if(!rentID){
            return res.status(400).json({msg:"Rent not recived",Success:success})
        }
       
        const createUser=new  Booking({
           name: name,
           mobile: number,
            BookID:id,
            date:finalDate,
            rent:rentID.rent,
            productName:rentID.name,
            note:note,
            user:req.user.id
        })
        
      
        if(!createUser){
            return res.status(401).json({msg:"Booking Creation Error",Success:success})
        }
       
        const booking=await createUser.save()
        success=true
          //Now Booking Date Update
      await Product.findOneAndUpdate({productID:id},{$push:{bookingDate:{userid:booking._id,
    date:finalDate,name:name}}},{new: true})
        return  res.status(200).json({booking,Success:true,msg:"your Data Successfully Submited"});

    } catch (error) {
        return res.status(409).json({msg:"Internal Server Error",error})
    }
})

// update User Bookings

router.patch("/update/:_id",Auth,async(req,res)=>{
    let success=false
    try {
    const {date,name,id,number,note}=req.body
    const newBooking={}
    if(date){newBooking.date=date};
    if(name){newBooking.name=name};
    if(id){newBooking.BookID=id};
    if(number){newBooking.mobile=number}
    if(note){newBooking.note=note}

      //Checking the user is already exist or not  
const finduser= await Booking.findOne({_id:req.params._id})

if(!finduser){
    return res.status(401).json({msg:"Customer Does Not Exist..!"})
}
let fixID=id|| finduser.BookID

// find user to store our data

const user= await Booking.find({user:req.user.id})

const findID= user.filter((val)=>{return val.BookID==fixID})




    //   const findID=await Booking.find({BookID: fixID});

      if(id){

        const objectData=await Product.find({user:req.user.id})
        const  object=objectData.filter((val)=>{return val.productID == id})[0]
        
        // const objectName=await Product.findOne({productID:id}).select('name rent')
        newBooking.productName=object.name;
        newBooking.rent=object.rent;
      }
      // my user filterd
     

      const filderdata=findID.filter((user)=>user._id.toString()!==req.params._id.toString())
      
        
      const existDate=filderdata.map((data) => data.date == date );

     
      
      const TrueIndex=existDate.indexOf(true); 

      
      // user convert in stringss
      const str=finduser._id.toString()
     
     if( !(req.params._id==str) || !(TrueIndex===-1)){
      return  res.status(422).json({msg:"This date has been booked by another User",Success:success})
     }

   
    const update=await Booking.findByIdAndUpdate({_id:req.params._id},{$set:newBooking},{new:true})

    if(!update){
        return res.status(401).json({msg:"No Data Found To Update",Success:success})
    }
// if Id Change to Opration done;
const ObjectId=new mongoose.Types.ObjectId(req.params._id)
const addDate= date || finduser.date
const addName=name || finduser.name
if(id){

    
    // await Product.updateOne({productID:finduser.BookID},{$pull:{"bookingDate":{"userid":ObjectId}}});

 await Product.updateOne({user:req.user.id,productID:finduser.BookID},{$pull:{"bookingDate":{"userid":ObjectId}}})

    
    await Product.updateOne({user:req.user.id,productID:id},{$push:{bookingDate:{userid:ObjectId,date:addDate,name:addName}}})
    
}
    // update Booking Date in Product

const findid=await Product.findOne({user:req.user.id,productID:fixID})

const setDate=findid.bookingDate.filter((data)=>data.userid.toString()==str)
let usr=setDate[0]?.userid

const productdate=await Product.findOneAndUpdate({productID:fixID,"bookingDate.userid":usr},{$set:{"bookingDate.$.date":date,"bookingDate.$.name":name}},{new:true})
 
if(!productdate){
    return res.status(401).json({msg:"No Data  Update on Booking date..",Success:success})
}

//finally Got A responce...

    return res.status(201).json({update,Success:true,msg:"Data SuccessFully Updated"})
    } catch (error) {
        return res.status(401).json({msg:"server error"})
    }
})

// delete user


router.delete('/userdelete/:_Id',Auth,async(req,res)=>
{   let success = false;
try {
    const user=await Booking.findById(req.params._Id)

    if(!user){
        return res.status(401).json({msg:"User Not Found!"})
    }
     // delete bookingDate Also in Product;
const id=req.params._Id

     const objectId=new mongoose.Types.ObjectId(id)
    

     const DelteBookingDate=await Product.updateOne({productID:user.BookID},{$pull:{"bookingDate":{"userid":objectId}}})


     if(!DelteBookingDate){
         return res.status(401).json({msg:"can not delete in BookingDate on Product",Success:success})
     }
    const userdelete=await Booking.findByIdAndDelete(req.params._Id);
if(!userdelete){
    return res.status(401).json({msg:`Error In Deletion`,Success:success})
}
   
// final responce on this Successfull Oprations; 
    success=true

    return res.status(201).json({msg:"data succsessfully deleted",Success:success})

} catch (error) {
    return res.status(401).json({msg:"server error"})
}

})

// fatch all  data from the database
router.get("/fetchallData",Auth, async (req, res) => {
  let  sucess=false
    try {
        const users = await Booking.find({user: req.user.id});
if(!users){
    return res.status(401).json({msg:"User Not Found!"})
}
sucess=true
        // Sending back a response 
        return res.status(200).json({data:users,Success:sucess,msg:"Fetch all booking ..!"});

      } catch (err) {
        console.log(err);
        return res.status(500).json("Server Error");
      }
});

// single booking  info by id

router.get("/details/:_id",async (req,res)=>{
    let sucess=false
try {
    const user=await  Booking.findOne({_id : req.params._id});
    if (!user) {
        return res.status(401).json({ msg: "No User found" ,Success:sucess })
        
    }
   sucess=true
    
return res.status(200).json({ data: user , Success:sucess,msg:"Successfully Fetch Data" });
    
} catch (error) {
    return res.status(500).json({msg:"server Eror",error:error});
}
})
export default router