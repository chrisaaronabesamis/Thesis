import { Router } from 'express';
import cloudinary from '../../cloudinaryConfig.js'; 

const cloudinaryRouter = Router();

cloudinaryRouter.post('/upload', async (req, res) => {
  try {
    // Check if a file was provided
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const file = req.files.file.tempFilePath; // Use temp file path provided by express-fileupload
    const result = await cloudinary.uploader.upload(file, { folder: 'uploads' });
    res.status(200).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
    
  }
});

export default cloudinaryRouter;
