// Since We’re repeating the same cookie options (httpOnly: true, secure: true) in multiple controllers 
// (loginUser, logoutUser, refreshAccessToken), you should make them global and reuse.

//This is just alternative way or you can say more cleane



// utils/cookieOptions.js
// Global cookie options used across the app
export const cookieOptions = {
    httpOnly: true, // Prevents client-side JS from accessing cookies
    secure: true,   // Ensures cookies are only sent over HTTPS
    sameSite: "strict" // Optional: prevents CSRF attacks (recommended)
};



// ✅ Step 2: Import wherever needed


import { cookieOptions } from "../utils/cookieOptions.js";

// Example: inside refreshAccessToken
return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refereshToken", newRefereshToken, cookieOptions)
    .json(
        new ApiResponse(
            200,
            { user: accessToken, refereshToken: newRefereshToken },
            "Access token refreshed successfully"
        )
    );

