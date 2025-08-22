// require('dotenv').config({path: `./env`})
// or 
import dotenv from "dotenv"

// import mongoose, { connect } from "mongoose";
// import { DB_NAME } from "./constants";

import connectDB from "./db/index.js";

dotenv.config({
    path:`./env`
})



connectDB()















/* //Approach 1
import express from "express";

//iife
(async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("Error",(error)=>{
            console.log("NOT able to talk to DB",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log("APP is listening on Port :",process.env.PORT);
            
        })
    } catch (error) {
        console.error("Error",error);
        throw error
        
    }
})()
*/