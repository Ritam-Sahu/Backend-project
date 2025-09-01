// errors handeling

// Error is the parent class (a built-in JavaScript class).
// ApiError is your child class that extends Error.

class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}


export { ApiError }



// It’s just a custom error class (blueprint for error objects).

// You throw it inside request handlers when something goes wrong.

// Later, the error-handling middleware checks if the error is an ApiError and formats the response.

// So → ApiError is a utility (class), not middleware.









// this.stack = stack: lets you manually set a stack trace
// (rarely needed, but useful in custom debugging).

// Error.captureStackTrace(this, this.constructor): automatically generates
// a clean stack trace starting from where the error was thrown, ignoring the constructor.