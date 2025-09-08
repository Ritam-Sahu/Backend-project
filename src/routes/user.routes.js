import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logOutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage 
    } from "../controllers/user.controller.js";
    
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route for registering a new user
router.route("/register").post(
    // Multer middleware to handle file uploads (avatar + coverImage)
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }]),
    // Actual controller that handles user registration
    registerUser)

router.route("/login").post(loginUser)

//secured route
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/coverimage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)


export default router;



// http://localhos:8000/users/register
// http://localhos:8000/users/login


// Rule of thumb

// GET: Use to fetch data without changing anything.

// POST: Use when creating a new resource or triggering an action.

// PUT: Use to completely replace an existing resource.

// PATCH: Use to modify some fields of an existing resource.

// DELETE: Use to remove a resource.

// OPTIONS: Use to check allowed HTTP methods or for CORS preflight.

// HEAD: Use to get headers/metadata of a resource without body





// Whenever you update image/files, you create a separate controller/endpoint to keep file handling logic isolated from other operations, ensuring single responsibility.
// This improves code clarity, easier debugging, and avoids mixing file upload logic with unrelated business logic