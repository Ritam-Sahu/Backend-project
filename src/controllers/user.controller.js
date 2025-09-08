//request handelers
import { asyncHandeller } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { use } from "react";
import mongoose from "mongoose";




// Utility function to generate both Access & Refresh tokens for a user
const genarateAccessAndRefeshTokens = async (userId) => {
    try{
        // 1. Find user in DB by their unique ID
        // (important: use findById so that you get the actual user document)
        const user = await User.findById(userId);

        // 2. Generate Access Token (short-lived JWT)
        const accessToken = user.genarateAccessTokens();

        // 3. Generate Refresh Token (long-lived JWT)
        const refereshToken = user.genarateRefershTokens();

        // 4. Store refresh token in user’s record in DB
        // (this helps validate refresh tokens later)
        user.refereshToken = refereshToken;

        // 5. Save user without running validations again (validateBeforeSave: false)
        await user.save({ validateBeforeSave: false })

        // 6. Return both tokens so controller can send to client
        return {accessToken, refereshToken};
    }
    catch (error){
        // Handle unexpected errors during token generation or DB update
        throw new ApiError(500, "Something Went Worng while generating refresh and access token");
    }
} 




const registerUser = asyncHandeller(async (req, res) => {
    // ✅ Steps for user registration:
    // 1. Get user details from frontend
    // 2. Validate inputs (fullname, email, username, password)
    // 3. Check if user already exists (by username or email)
    // 4. Handle file uploads (avatar required, cover image optional)
    // 5. Upload files to Cloudinary
    // 6. Create new user in DB
    // 7. Exclude sensitive fields (password, refreshToken) before sending response
    // 8. Return success response

    
    // 1. Extract data from request body
    // destrucring for ease of use
    const {fullname, email, username, password} = req.body
    console.log("email: ", email);



    // 2. Validate required fields
    // - Check if any field is missing or empty string

    // if(fullname === ""){
    //     throw new ApiError(400, "fullname is required")
    // }

    
    // other advance approach 
    if(
        [fullname,password,email,username].some((field) => {
            return field?.trim() === ""
        })
    ){
        throw new ApiError(400,"ALL fields are required")
    }
    //or we can write
    // if (
    //         fullname.trim() === "" ||
    //         password.trim() === "" ||
    //         email.trim() === "" ||
    //         username.trim() === ""
    //     ) {
    //         throw new ApiError(400, "ALL fields are required")
    //     }


    // here is an alternative of above cpde based logic discuss
    // if(!(username || email)){
//         throw new Error(400, "userbname or email is required");
// }



    // 3. Check if user already exists
    // - Either with same email OR same username
    const exitedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(exitedUser){
        throw new ApiError(409, "user with email or username already exits ")
    }

    // console.log(req.files);
    




    // 4. Handle file uploads (from multer) midlleware give acces to files
    // - Avatar is mandatory
    // - Cover image is optional
    // (?.) is used if present(optional)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

 
    // check for images, check for avtar
    if(!avatarLocalPath){
        throw new ApiError(400, " Avatar file is needed ")
    }




    // 5. Upload images to Cloudinary
    const avatar =  await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, " Avatar is needed ")
    }



    // 6. Create user in database
    // - Save avatar & cover image URLs
    // - Username is converted to lowercase
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", 
        password,
        email,
        username: username.toLowerCase()
    })



    // 7. Fetch newly created user
    // - Exclude sensitive fields (password, refreshToken)
    // - NOTE: must use `User.findById` (Model) not `user.findById` (Document)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new ApiError(500, "something went wrong in server")
    }




    // 8. Send success response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registerd succesfully")
    )


})




const loginUser = asyncHandeller(async(req,res) => {
    //bring data from req body 
    //username or email login
    // find the user
    //check the password if worng ->return "wrong password" else
    //acces and referesh token and acces both genarted 
    //and give to user in form of cookie cookie
    //response succefull




    // 1. Extract login credentials from request body
    // (client may provide either username or email + password)
    const { username, email, password } = req.body;

    //check if user enter valid email or username
    if(!username || !email){
        throw new ApiError(400," please enter a valid email or username ");
    }


    // 3. Try to find the user in DB by username OR email
    // ($or ensures either condition can match)
    const user = await User.findOne({
        $or: [{username},{email}]  //means either this OR that condition must match.
    })
    // 4. If user doesn’t exist → throw 404
    if(!user){
        throw new ApiError(404, "username or email doesnot exits please register")
    }



    //User is moongose object and methods through mongoose are available
    //the methods we custom made are availabe in my user which we get back form database
    // so User and user both are different
    // check the password 
    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if(!isPasswordValid){
        throw new ApiError(401, "Ivalid user Credentials, Please emnter a correct password")
    }



    // 6. Generate Access + Refresh tokens for session management
    //  - Access token: short-lived (e.g. 15m)
    //  - Refresh token: long-lived, stored in DB
    const { accessToken, refereshToken } = await genarateAccessAndRefeshTokens(user._id);


    // ✅ Fetch the latest user details from DB
    // - We refetch using `findById` so we get a clean object after any updates
    // - `.select("-password -refreshToken")` ensures we exclude sensitive fields
    const loggedinUser = await User.findById(user._id).select("-passwoed -refreshToken")



    // ✅ Cookie options for security
    // - httpOnly: JavaScript on client-side cannot access cookies (prevents XSS attacks)
    // - secure: cookie only sent over HTTPS (not plain HTTP)
    const options = {
        httpOnly: true,
        secure: true
    }


    // ✅ Send response back to client
    // - Set both accessToken & refreshToken in cookies
    // - Return user details + tokens in JSON (without sensitive fields)
    // - Use ApiResponse wrapper for consistent API responses
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refereshToken", refereshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedinUser, accessToken, refereshToken
            },
            "User logged in succefully"
        )
    )

})


const logOutUser = asyncHandeller( async(req,res) => {
    // 📝 Middleware ensures req.user exists (set by verifyJWT)

    // 1. Remove the refresh token from the user in DB
    // (so even if someone has the old cookie, it's useless)
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refereshToken : undefined 
            }
        },
        {
            new: true
        }
    )

    
    // 2. Cookie options (important for security)
    const options = {
        httpOnly : true,
        secure: true
    }


    // 3. Clear auth cookies & send response
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refereshToken", options)
    .json(new ApiResponse(200,{}, "User Logged out succesfully"))
})




const refreshAccessToken = asyncHandeller(async (req, res) =>{

   // 1. Get incoming refresh token from cookies or request body
   const incomingRefereshToken =  req.cookies.refereshToken || req.body.refereshToken

   if(!incomingRefereshToken){
        // No refresh token → user is not authorized
        throw new ApiError(401, "unauthorized request") 
   }



   try {
    // 2. Verify & decode refresh token using secret
    const verifyToken = jwt.verify(incomingRefereshToken, process.env.REFRESH_TOKEN_SECRET);
 

    // 3. Find the user from decoded token payload (_id)
    const user = await User.findById(verifyToken?._id);
 
    if(!user){
     throw new ApiError(401, "invalid Refresh Tokens");
    }
 
    // 4. Compare incoming refresh token with the one saved in DB
    if(incomingRefereshToken !== user?.refereshToken){
     // Token is either expired or already used   
     throw new ApiError(401, "referesh token is expired or used")
    }
 
    // 5. Cookie options for security
    const options = {
     httpOnly: true,
     secure: true
    } 
    
    // 6. Generate new access & refresh tokens
    const  {accessToken, newRefereshToken} = await  genarateAccessAndRefeshTokens(user._id);
    

    // 7. Send back new tokens in cookies + response body
    return res
     .status(200)
     .cookie("accessToken", accessToken, options) // replace old access token
     .cookie("refereshToken", newRefereshToken, options) // replace old refresh token
     .json(
         new ApiResponse(
             200,
             {
                 user:  accessToken, refereshToken: newRefereshToken
             },
             "Access token refreshed succfully"
         )
     )
   } catch (error) {
    // If anything goes wrong → refresh failed
        throw new ApiError(401, error?.message || "Invalid Refresh token")
   }

})






const changeCurrentPassword = asyncHandeller(async (req, res)=>{

    // Get old and new passwords from request body
    const {oldPassword , newPassword} = req.body;
    
    // Find the current logged-in user by ID (from auth middleware)
    const user = await User.findById(req.user?._id);

    // Check if the old password is correct
    const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    // Update the password with the new one
    user.password = newPassword

    // Save the updated user object to database
    // This triggers the pre-save hook (for password hashing)
    // { validateBeforeSave: false } skips validation for fields unrelated to the password.
    await user.save({validateBeforeSave: false})

    // Send a success response
    return res
    .status(200)
    .json(new ApiResponse (200,{},"Password Changed succesfully") )
})



const getCurrentUser = asyncHandeller(async(req, res)=>{
    return res
    .status(200)
    .json(new ApiResponse (200,req.user, "current User Fetched Successfully"))
})




const updateAccountDetails = asyncHandeller(async (req, res)=>{

    // Extract fullname and email from request body
    const {fullname,email}  = req.body;

    // Validate that both fullname and email are provided
    if(!fullname || !email){
        throw new ApiError(400,"all fileds are required")
    }

    // Update the user's fullname and email by their ID
    const user = await User.findByIdAndUpdate(
        req.user?._id,  // Get currently authenticated user's ID from request
        {
            $set: { // Set new values for fullname and email
                fullname: fullname,
                email: email
            }
        },
        {new: true} // Return the updated document
    ).select("-password") // Exclude the password from the returned user object

    // Handle case when user is not found in the database
    if (!user) {
        throw new ApiError(404, "user not Found")
    }

    // return the response
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})


const updateUserAvatar = asyncHandeller(async(req, res)=>{

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is Missing")
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400, "Error While uploading")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")


    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Upload Succesfully" ))
})


const updateUserCoverImage = asyncHandeller(async(req, res)=>{

    const coverImageLocalPath = req.file?.path

    if(coverImageLocalPath){
        throw new ApiError(400,"Cover Image file is Missing")
    }

    const coverImage =  await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400, "Error While uploading")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")


    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Upload Succesfully" ))
})


const getUserChannelProfile = asyncHandeller(async (req, res) =>{
    const {username} = req.params

    // Validate input username
    if(!username?.trim()){
        throw new Error(400, "username is missg")
    }
    
    // MongoDB Aggregation Pipeline to fetch channel profile
    const channel= await User.aggregate([
        {
            // Match user by username
            $match:{
                username: username?.toLowerCase()
            }
            // The left-hand side (username) refers to the field in the MongoDB document.
            // The right-hand side (username) refers to the JavaScript variable we got from the request parameters
        },
        {
            // Lookup subscriptions where user is the channel (subscribers)
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscribe",
                as: "subscribedTo"
            }
        },
        {
            //  Add computed fields
            $addFields:{
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubcribedToCount:{
                    $size:"subscribedTo"
                },
                isSubscribed: {
                    $cond:{
                        if:{
                            $in:[req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            // Select only relevant fields to return
            $project:{
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubcribedToCount: 1,
                isSubscribed:1,
                avatar: 1,
                coverImage: 1,
                email:1
            }
        }
    ])
    
    // Handle if no channel found
    if(!channel?.length){
        throw new ApiError(404,"channel doest not exits")
    }

    // Return successful response with channel profile
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0], "user channel fetched susccesfully")
    )

})



//nested lookup
const getWatchHistory = asyncHandeller(async (req,res)=>{

    // req.user._id
    // It’s a string, e.g., "64f0c4b758cfe3a70f5bcdef".

    const user = await User.aggregate([
        {
            // This retrieves the document of the currently authenticated user.
            $match:{
                // Mongoose ObjectId creation from string
                // Converts the string into a MongoDB ObjectId instance.
                // user is a custom property that you (or your authentication middleware)
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                //for nested pipeline
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    // This adds the owner's basic information into the owner field of the video.
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res 
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"watch history fetch succesfully"))
})






export { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails,updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory };



// if data comes from form or json
// const { email, password } = req.body;

// instead of
// const email = req.body.email;
// const password = req.body.password;







// Here’s the simple distinction between User and user in your Node.js + Mongoose app:

// User (with uppercase “U”):
// Refers to the Mongoose Model.
// Used for database-level operations like querying, creating, updating, deleting documents.
// const userFromDb = await User.findById(id);
// const newUser = await User.create({...});



// user (with lowercase “u”):
// Refers to an instance of the User document, retrieved from the database.
// It represents a single user object, with fields like user.email, user.password, etc.
// You can also call custom instance methods on it:
// const isValid = await user.isPasswordCorrect(password);
// user.password = newPassword;
// await user.save();














// You create an array with the required fields:

// [fullname, password, email, username]
// You use .some():
// .some(callback) returns true if at least one element in the array passes the condition.
// The callback:
// (field) => field?.trim() === ""
// field?.trim():
// ? = optional chaining, avoids errors if field is undefined or null.
// .trim() removes spaces from start and end.
// So if the field is empty string ("") → condition is true.
// If any field is empty → .some() returns true → you throw an ApiError.