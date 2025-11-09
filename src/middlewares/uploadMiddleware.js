import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

// Allowed image types
const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadSingleImage = multer({
    storage,
    limits: { 
        fileSize: MAX_FILE_SIZE,
        files: 1 // Only allow one file
    },
    fileFilter: (req, file, cb) => {
        // Check MIME type
        const mimeType = ALLOWED_IMAGE_TYPES.test(file.mimetype);
        // Check file extension
        const extname = ALLOWED_IMAGE_TYPES.test(path.extname(file.originalname).toLowerCase());
        
        if (mimeType && extname) {
            return cb(null, true);
        }
        
        cb(new Error(`Only image files are allowed (jpeg, jpg, png, gif, webp). Received: ${file.mimetype}`));
    }
}).single("image");
