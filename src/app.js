import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";



const app = express();


// Only allow requests from the origin set in your environment variable.
// credentials: true ,Allows cookies, authentication headers (Authorization), etc. to be sent cross-origin.
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))


//data comes in many ways like url/ Form/Json form

//if data come in json Form
app.use(express.json({
    limit:"16kb"
}))

//if data come in Url form
app.use(express.urlencoded({extended:true,limit:"16kb"}))

// “Serve all files inside the public folder directly to the client as static files.”
app.use(express.static("public"))


//Cookie parsor -> we can acces user browser cookie and also set the cookie
//basically curd operation of cookie on user browser
//sequre cookie only sever can read and delete
app.use(cookieParser())


export { app }