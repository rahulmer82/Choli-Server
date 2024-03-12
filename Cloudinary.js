import fs from "fs"
import dotenv from "dotenv"
import {v2 as cloudinary} from 'cloudinary';
          dotenv.config()
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});


const CloudinaryUpload= async(localFilePath)=>{
try {
    if(!localFilePath){
        return null
    }

    const responce=await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})

    fs.unlinkSync(localFilePath) //delete the local file after uploading to cloudinary

    return responce;
} catch (error) {
    fs.unlinkSync(localFilePath);
    return null
}
}

export default CloudinaryUpload;