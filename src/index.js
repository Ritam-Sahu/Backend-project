// require('dotenv').config({path: `./env`})
// or 
import dotenv from "dotenv"

// import mongoose, { connect } from "mongoose";
// import { DB_NAME } from "./constants";

import connectDB from "./db/index.js";
import { connect } from "mongoose";

dotenv.config({
    path:`./env`
})


const Port = process.env.PORT || 8000;

// we write async method for database so whenever async method is completed
// a Promise will return //this is common in code bases

// so whenever Db is connected 
connectDB()
.then(()=>{

    //for error listing
    app.on("Error",(error)=>{
        console.error("Error!! ", error);
    })

    app.listen(Port,() => {
        console.log(`server is running,${Port}`);
        
    })
})
.catch((error) => {
     console.log("DB Connection is Failed !!!",error);
})















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