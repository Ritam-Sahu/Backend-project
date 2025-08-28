import mongoose, { Mongoose, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    usename:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String,
        required: true,   //cloudinary URL (aws like services, where image and videos)
    },
    coverImage:{
        type: String   //cloudinary URL
    },
    watchHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type: String,
        required: [true,'password is required']
    },
    refreshToken:{
        type: String
    }
},{timestamps: true})



// don't use arrow function as we can't use this in arrow function
//encryption its complex process that's why we use async await
//we have to pass next as its middleware: so that it can tell flag move it forward
userSchema.pre("save", async function(next){

    // check if password is modified or not
    if(!this.isModified("password")) return next();

    // hash the password before saving
    this.password = await bcrypt.hash(this.password, 10);
    // move to next middleware
    next();
}) 


// custom method desiging in Mongoose 
//isPasswordCorrect is cutom method made by us and return true or false
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}


//jwt.sign() generates the token string and return it
userSchema.methods.genarateAccessTokens = async function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.genarateRefershTokens = function(){
     return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}





export const User = mongoose.model("User", userSchema);








//if you want seraching filed effcient
// use index: true






// In Mongoose, methods lets you define custom functions that can be used
// on model instances (documents).





// Explanation:
// userSchema.pre("save") → this hook runs before saving a document.
// function(next) → you can’t use arrow function here, because this must refer to the current document (the user).
// this.isModified("password") → ensures that the password is only hashed if it’s newly set or changed. (Prevents double-hashing.)
// bcrypt.hash(this.password, 10) → hashes password with 10 salt rounds.
// next() → tells Mongoose to continue the saving process.
// This ensures passwords are always stored in hashed form, never in plain text.


// userSchema.methods → lets you add custom methods to a Mongoose model.
// isPasswordCorrect → now every user document will have this function available.
// bcrypt.compare(password, this.password) → compares entered password with hashed password in DB.
// Returns true if passwords match, else false.

