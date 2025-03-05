// as we change in pck.json and mention {type:"module"} below require will not work 
// require('dotenv').config({path:'./env'}); 
import dotenv from "dotenv" 
//and to make import work for dotenv " below step should must be performed"
// in pak.json in script in dev add {dev:nodemon -r dotenv/config --experimental-json-modules src/script }
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDB()