import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function(req,file,cb){
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null,file.fieldname)
    }
})

const upload = multer({storage:storage});

export { upload };

// cb=callback 



// destination → where to save the file temporarily on server (./public/temp).

// filename → decides the name of the saved file.
// Currently, it just uses file.fieldname (e.g., avatar, resume).
// (Optional: You can make it unique using timestamp/UUID.)



// We use Multer as middleware to temporarily store files on the server (./public/temp), 
// then pass those files to a Cloudinary utility for permanent storage.
// This two-step approach makes error handling and reusability much cleaner.”