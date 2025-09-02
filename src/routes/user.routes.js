import { Router } from "express";
import { loginUser, logOutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route for registering a new user
router.route("/register").post(
    // 1️⃣ Middleware for handling file uploads
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }]),
    // 2️⃣ Actual controller that handles user registration
    registerUser)

router.route("/login").post(loginUser)

//secured route
router.route("/logout").post(verifyJWT, logOutUser)

export default router;



// http://localhos:8000/users/register
// http://localhos:8000/users/login