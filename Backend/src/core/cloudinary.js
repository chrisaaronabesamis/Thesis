import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

config(); 

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL 
});

export default cloudinary;
