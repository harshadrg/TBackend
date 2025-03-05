// as we change in pck.json and mention {type:"module"} below require will not work 
// require('dotenv').config({path:'./env'}); 
import dotenv from "dotenv" 
//and to make import work for dotenv " below step should must be performed"
// in pak.json in script in dev add {dev:nodemon -r dotenv/config --experimental-json-modules src/script }
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.on("errorr",((error)=>{
        console.log("ERRORR:", error);
        throw error
        
    }))
    app.listen(process.env.PORT || 8080, ()=>{
        console.log(`Server is running on port: ${process.env.PORT}`);
        
    })
})
.catch((err)=>{
    console.log("mongodb connection failed!", err);
    
})