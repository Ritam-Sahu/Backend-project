import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// Reads Cloudinary credentials from .env.
// Secures keys instead of hardcoding them.




const uploadOnCloudinary = async (localFilePath)=>{
    try {

        // Takes a file’s local path (saved temporarily by multer).
        if(!localFilePath) return null

        // upload the file on cloudinary
       const response =  await cloudinary.uploader.upload(localFilePath, {resource_type: 'auto'})

        //file has been uploaded succesfull
        console.log("File is uploaded in cloudinary!!",response.url);
        fs.unlinkSync(localFilePath)
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally save temporary file as the upload operation got failed
        return null

    }
}

export { uploadOnCloudinary }


// use ctrl + space for suggestions


//example of file upload
// cloudinary.v2.uploader
// .upload("dog.mp4", {
//   resource_type: "video", 
//   public_id: "my_dog",
//   overwrite: true, 
//   notification_url: "https://mysite.example.com/notify_endpoint"})
// .then(result=>console.log(result));



// exaple OUTPUt of response

// File is uploaded in cloudinary!! {
//   asset_id: 'abcd1234efgh5678',
//   public_id: 'foldername/myimage',
//   version: 1694778136,
//   version_id: 'xyz987654321',
//   signature: 'someSignature',
//   width: 1920,
//   height: 1080,
//   format: 'jpg',
//   resource_type: 'image',
//   created_at: '2023-09-15T12:35:36Z',
//   tags: [],
//   bytes: 345678,
//   type: 'upload',
//   etag: 'etagstring',
//   placeholder: false,
//   url: 'http://res.cloudinary.com/your-cloud-name/image/upload/v1694778136/foldername/myimage.jpg',
//   secure_url: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1694778136/foldername/myimage.jpg',
//   folder: 'foldername'
// }