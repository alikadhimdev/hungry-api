import fs from "fs";
import path from "path";
import { AppError } from "../utils/appError.js";

// Allowed image MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate image file
const validateImage = (file) => {
    if (!file) {
        return { valid: false, error: "No file provided" };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return { 
            valid: false, 
            error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` 
        };
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return { 
            valid: false, 
            error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` 
        };
    }

    return { valid: true };
};

export const deleteOldImage = async (imagePath) => {
    if (!imagePath) return;
    try {
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        const filePath = path.join(process.cwd(), "public", cleanPath);
        
        // Check if file exists before trying to delete
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    } catch (error) {
        console.error("فشل في حذف الصورة القديمة: ", error.message);
        // Don't throw error, just log it
    }
};

export const processImageUpdate = async (req, currentImagePath) => {
    if (req.file) {
        // Validate image
        const validation = validateImage(req.file);
        if (!validation.valid) {
            throw new AppError(400, `صورة غير صالحة: ${validation.error}`, `Invalid image: ${validation.error}`);
        }

        // Create unique filename
        const fileName = `${Date.now()}${path.extname(req.file.originalname)}`;
        const uploadDir = "public/uploads";

        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Write file from memory buffer to disk
        const filePath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(filePath, req.file.buffer);

        const newImagePath = `/uploads/${fileName}`;

        // Delete old image
        await deleteOldImage(currentImagePath);

        return {
            image: newImagePath,
            imageUpdated: true,
            imageDeleted: false
        };
    } else if (req.body.deleteImage === "true") {
        await deleteOldImage(currentImagePath);
        return {
            image: null,
            imageUpdated: true,
            imageDeleted: true
        };
    } else {
        return {
            image: currentImagePath,
            imageUpdated: false,
            imageDeleted: false
        };
    }
};

export const processImageCreation = async (req) => {
    if (!req.file) return { imagePath: null };

    // Validate image
    const validation = validateImage(req.file);
    if (!validation.valid) {
        throw new AppError(400, `صورة غير صالحة: ${validation.error}`, `Invalid image: ${validation.error}`);
    }

    const uploadDir = "public/uploads";
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file from memory buffer to disk
    await fs.promises.writeFile(filePath, req.file.buffer);
    const imagePath = `/uploads/${fileName}`;
    return { imagePath };
};

export const processImageDeletion = async (imagePath) => {
    if (imagePath) {
        await deleteOldImage(imagePath);
    }
};
