import express from "express";
import { Booking } from "../Models/BookinsModel.js";
import { Product } from "../Models/Procut.js";
import mongoose from "mongoose";
const router = express.Router();

router.post('/adduser',async(req,res)=>{
    let success=false

    try {
        const {name,number,id,date}=req.body;
        if(!( name && number && id)){
            return res.status(401).json({msg:"All Filds Required..!",Success:success})
        };

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

        const findID=await Booking.find({BookID:id});
        
        const existDate=findID.map((data) => data.date == finalDate );
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
            productName:rentID.name
        })
        
      
        if(!createUser){
            return res.status(401).json({msg:"Booking Creation Error",Success:success})
        }
       
        const booking=await createUser.save()
        success=true
          //Now Booking Date Update
      await Product.findOneAndUpdate({productID:id},{$push:{bookingDate:{userid:booking._id,
    date:finalDate}}},{new: true})
        return  res.status(200).json({booking,Success:true});

    } catch (error) {
        return res.status(409).json({msg:"Internal Server Error",error})
    }
})

// update User Bookings

router.patch("/update/:_id",async(req,res)=>{
    let success=false
    try {
    const {date,name,id,number}=req.body
    const newBooking={}
    if(date){newBooking.date=date};
    if(name){newBooking.name=name};
    if(id){newBooking.BookID=id};
    if(number){newBooking.mobile=number}

      //Checking the user is already exist or not  
const finduser= await Booking.findOne({_id:req.params._id})

if(!finduser){
    return res.status(401).json({msg:"Customer Does Not Exist..!"})
}
let fixID=id|| finduser.BookID

      const findID=await Booking.find({BookID: fixID});

      if(id){
        const objectName=await Product.findOne({productID:id}).select('name rent')
        newBooking.productName=objectName.name;
        newBooking.rent=objectName.rent;
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
if(id){
    await Product.updateOne({productID:finduser.BookID},{$pull:{"bookingDate":{"userid":ObjectId}}});
    
    await Product.updateOne({productID:id},{$push:{bookingDate:{userid:ObjectId,date:addDate}}})
    
}
    // update Booking Date in Product

const findid=await Product.findOne({productID:fixID})

const setDate=findid.bookingDate.filter((data)=>data.userid.toString()==str)
let usr=setDate[0]?.userid

const productdate=await Product.findOneAndUpdate({productID:fixID,"bookingDate.userid":usr},{$set:{"bookingDate.$.date":date}},{new:true})
 
if(!productdate){
    return res.status(401).json({msg:"No Data  Update on Booking date..",Success:success})
}

//finally Got A responce...

    return res.status(201).json({update,Success:true})
    } catch (error) {
        return res.status(401).json({msg:"server error"})
    }
})

// delete user
router.delete('/userdelete/:_Id',async(req,res)=>
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
export default router