//make a method and exported

//helper file 
const asyncHandeller = (requestHandler) =>{
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}


export { asyncHandeller };



// 🔹 What it means

// asyncHandeller is a Higher-Order Function
// It takes a function (requestHandler) as input.
// Returns another function (req,res,next) for Express.
// Wraps your async route handlers
// Normally, in Express, if an async function throws an error, you must try/catch it.
// This wrapper automatically catches errors (using Promise.resolve(...).catch(...)).
// Forwards errors to Express
// Instead of crashing, it passes the error to next(err).
// Then your global error middleware can handle it.

















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