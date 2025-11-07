import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

export const uploadSingleImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const fileType = /jpeg|jpg|png|gif/;
        const mimeType = fileType.test(file.mimetype);
        const extname = fileType.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extname) return cb(null, true);
        cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
    }
}).single("image");
