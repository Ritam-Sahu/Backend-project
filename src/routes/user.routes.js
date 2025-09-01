import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";


const router = Router();

router.route("/register").post(registerUser)
// router.route("/login").post(loginUser)

export default router;



// http://localhos:8000/users/register
// http://localhos:8000/users/login