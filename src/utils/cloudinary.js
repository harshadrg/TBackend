 import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
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
        cloudinary.uploader.upload(localFilePath, {
            resource_type:"image"
        })
        console.log("image/video is uploaded", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)//remove the locally save temp file if upload fails
        return null;
    }
 }

 export {uplodeOnCloudinary}