//make a method and exported

//helper file 
const asyncHandeller = (requestHandler) =>{
    return (req,res,next) => {
        // Convert requestHandler result into a Promise
        Promise.resolve(requestHandler(req,res,next))
        // If it rejects, catch the error and pass to next()
        .catch((err)=>next(err))
    }
}


export { asyncHandeller };



// 🔹 What it means

// ==============================================
// asyncHandler (higher-order function)
// ----------------------------------------------
// Purpose: 
// - To handle errors in async route handlers/controllers
// - Wraps the given async function (requestHandler)
// - Automatically catches rejected Promises (errors) 
//   and forwards them to Express error middleware
// ==============================================

















// under the hood 
// const asyncHandeller = (fun) => {
//    async () => {

//     }
// }

//using try catch
// const asyncHandeller = (fn) => async (req, res, next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }


//fn or requestHandeler wrote in route/contorller




// asyncHandeller itself is NOT middleware.
// It’s a higher-order function — it returns a middleware.
// The middleware it returns is (req,res,next)=>{...}.
// That one is middleware.


//  Simple analogy
// Think of asyncHandeller as a middleware factory 

// You give it your requestHandler (route handler).

// It gives you back a middleware that wraps it safely with error handling.