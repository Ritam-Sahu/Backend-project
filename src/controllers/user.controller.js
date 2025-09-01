//request handelers
import { asyncHandeller } from "../utils/asyncHandler.js";



const registerUser = asyncHandeller(async (req, res) => {
    res.status(200).json({
        message: "I learn something new"
    })
})

// const loginUser = asyncHandeller(async (req, res) => {
//     res.status(200).json({ message: "User logged in successfully" });
// });


export { registerUser };