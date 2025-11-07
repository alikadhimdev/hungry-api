import path from "path";
import fs from "fs";


export const deleteOldImage = async (imagePath) => {
    if (!imagePath) return;
    try {
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        const filePath = path.join(process.cwd(), "public", cleanPath);
        await fs.promises.unlink(filePath);
    } catch (error) {
        console.log("فشل في حذف الصورة القديمة: ", error);
    }
};

export const processImageUpdate = async (req, currentImagePath) => {

    if (req.file) {
        const newImagePath = `/uploads/${req.file.filename}`;
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
    if (req.file) {
        return `/uploads/${req.file.filename}`;
    }
    return null;
};

export const processImageDeletion = async (imagePath) => {
    if (imagePath) {
        await deleteOldImage(imagePath);
    }
};
