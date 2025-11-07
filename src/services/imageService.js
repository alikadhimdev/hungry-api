import fs from "fs";
import path from "path";

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
        // Create unique filename
        const fileName = `${Date.now()}${path.extname(req.file.originalname)}`;
        const uploadDir = "public/uploads";

        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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

    const uploadDir = "public/uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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
