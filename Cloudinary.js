import fs from "fs"

import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'rahulmer', 
  api_key: '532478123188828', 
  api_secret: 'AVwkKk1hU311KurnOdfeNVP8yE4' 
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