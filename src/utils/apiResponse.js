class ApiResponse{
    constructor(statusCode,data,message = "Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse };






// It’s just a helper class to standardize how success responses look.

// You create an object from it and send with res.json(new ApiResponse(...)).

// So → ApiResponse is a utility (class), not middleware.