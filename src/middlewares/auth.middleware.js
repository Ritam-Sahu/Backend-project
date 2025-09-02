// JWT verfication middleware

import { ApiError } from "../utils/ApiError";
import { asyncHandeller } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";




// Middleware to verify JWT token
// This protects routes by ensuring the request has a valid access token
// asyncHandeller(async (req , _, next) ) as not used 
export const verifyJWT = asyncHandeller(async (req , res, next) =>{
    try {

        // 1. Extract token
        // - Prefer accessToken from cookies
        // - Fallback to "Authorization: Bearer <token>" header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    

         // 2. Verify and decode token using secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    

        // 3. Fetch user from DB (remove sensitive fields like password, refreshToken)
        const user = await User.findById(decodedToken?._id).select("-password", "-refereshToken");
    
        if(!user){
            throw new ApiError(401, "invalid Acess Token")
        }
    
        // 4. Attach user info to request object (so controllers can use req.user)
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invaild access token")
    }
})




// next_video:discuss about front end