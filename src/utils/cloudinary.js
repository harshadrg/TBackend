 import { v2 as cloudinary } from "cloudinary";
 import fs from "fs";

 cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
    api_key: process.env.CLOUDINARY_API_KEY , 
    api_secret: process.env.CLOUDINARY_API_SECRET
 });

 const uplodeOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload file on server (i.e cloudinary)
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type:"auto"
        })
        fs.unlinkSync(localFilePath)
        return response;
        //  console.log("image/video is uploaded", response.url);
        //remove file form local server
    } catch (error) {
        fs.unlinkSync(localFilePath)//remove the locally save temp file if upload fails
        return null;
    }
 }

 export {uplodeOnCloudinary}