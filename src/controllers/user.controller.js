//request handelers
import { asyncHandeller } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";



const registerUser = asyncHandeller(async (req, res) => {
    // to register the steps we follwed
    // get user details from forntend
    // validation(email,empty username etc)
    // check if user already  exits : username and email
    // check for images, check for avtar
    // upload them to cloudinary,avatar
    // create user object - create entry in db
    // remove password and referesh token field form response
    // check for user creation
    // return response

    
    // get user details from forntend
    // destrucring for ease of use
    const {fullname, email, username, password} = req.body
    console.log("email: ", email);



    // validation(email,empty username etc)
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


    // check if user already  exits : username and email
    const exitedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(exitedUser){
        throw new ApiError(409, "user with email or username already exits ")
    }

    // console.log(req.files);
    

    //midlleware give acces to files
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


    // upload them to cloudinary,avatar
    const avatar =  await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, " Avatar is needed ")
    }


    // create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", 
        password,
        email,
        username: username.toLowerCase()
    })


    // remove password and referesh token field form response
    // check for user creation
    const createdUser = await user.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new ApiError(500, "something went wrong in server")
    }



    //returning response

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registerd succesfully")
    )


})

// const loginUser = asyncHandeller(async (req, res) => {
//     res.status(200).json({ message: "User logged in successfully" });
// });


export { registerUser };



// if data comes from form or json
// const { email, password } = req.body;

// instead of
// const email = req.body.email;
// const password = req.body.password;







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