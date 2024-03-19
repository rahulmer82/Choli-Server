import express from "express"
import { Product } from "../Models/Procut.js";
import mongoose from "mongoose";
import { Upload } from "../Midelware/Multer.js";
import CloudinaryUpload from "../Cloudinary.js";
import Auth from "../Midelware/Auth.js"

const route=express.Router()

route.post('/addproduct',Auth,Upload.single("image"), async(req,res)=>{
    let Success=false;

 try {
    const {id,name,rent}=req.body;
    if(!id && !rent){
        Success=false
        return res.status(400).json({msg:"Please provide all fields.",Success:Success})
    }

    const findprodct=await Product.find({user:req.user.id,productID:id})
   

    if(findprodct.length !==0){
        return  res.status(409).json({msg:"Product already exists!",Success:Success});
    }
//image Path
let imagePath;
if(req.file){
    const localImage=req.file.path
    
    const uploadImage=await CloudinaryUpload(localImage)
    imagePath=uploadImage.url
}



    const Createproduct= new Product({
        productID:id,
        name:name,
        image:imagePath,
        rent:rent,
        user:req.user.id
    })
   
if(!Createproduct){
return  res.status(409).json({msg:"Product Not Created at this Moment..!",Success:Success});
}
const product=await  Createproduct.save();
Success=true
return res.status(201).json({product:product,Success:Success,msg:"Your Product Registerd...!"})
 } catch (error) {
   return res.status(400).json({msg:"Server Error",error})
 }   


    
});

// Fetch all products

route.get('/products',Auth,async(req,res)=>{
    let success=false
    try {
       
        const product=await Product.find({user:req.user.id})
        
        if(!product){
         return   res.status(401).json({msg:"Product does Not Exist..!",Success:success})
        }
        success=true
        res.status(201).json({product:product,Success:success,msg:"fetch Products"})
        
    } catch (error) {
     return   res.status(402).json({msg:"server error",error})
    }
})

// fatch single product

route.get('/product',Auth,async(req,res)=>{
    let success=false
    try {
       const {id}=req.body;
        const product=await Product.findOne({user:req.user.id,productID:id})
        

        if(!product){
          return  res.status(401).json({msg:"Product does Not Exist..!",Success:success})
        }
        success=true
        res.status(201).json({product:product,Success:success,msg:'Single Product'})
        
    } catch (error) {
      return  res.status(402).json({msg:"server error",error})
    }
})

//prouct edit functionality

route.patch('/productedit/:_id',Auth,Upload.single("image"), async(req,res)=>{

    let success=false
    try {
        const {name,id,rent}=req.body;
        const {_id}=req.params
       const newproduct={}
       if(name){newproduct.name=name}
       if(id){newproduct.productID=id}
       if(rent){newproduct.rent=rent}
const objectId=new mongoose.Types.ObjectId(_id)
       const findproduct=await Product.findById({_id:objectId})
    

       const alerdyid=await Product.find({user:req.user.id,productID:id})

       
        const filter=alerdyid.filter((item)=>item._id.toString() !== findproduct._id.toString())

        

        if (findproduct.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }



       if(filter.length>0){
       return res.status(403).json({msg:'This ID is already in use',Success:success})
       }
if(req.file){
   let updateImage=req.file.path;
   const UploadImage=await CloudinaryUpload(updateImage);
   newproduct.image=UploadImage.url
}

        const update=await Product.findByIdAndUpdate({_id:_id},{$set:newproduct},{new:true})

        if(!update){
           return res.status(404).send("No user with given id")  
        }
        success=true
        res.status(200).json({product:update,Success:success,msg:'Data Updated Successfully'}) 


        
    } catch (error) {
    return res.status(401).json({msg:"internal server Error",error})   
    }
})
// delete products

route.delete('/remove/:_id',async(req,res)=>{
    let success = false;
    try {
        const prodcut=await Product.findByIdAndDelete(req.params._id)
        if (!prodcut) {
            return res.status(404).send('No product with this Id')
          }

          if (prodcut.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        

          success = true
          res.status(200).json({msg:'Product Deleted Successfully',Success:success})
    } catch (error) {
        return res.status(401).json({msg:"internal server Error",error}) 
    }
})
export default route

