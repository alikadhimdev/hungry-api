import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, "public/uploads")
    },
    filename: (req, file, cd) => {
        cd(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (req, file, cd) => {
        const fileType = /jpeg|jpg|png|gif/;
        const mimeType = fileType.test(file.mimetype)
        const extname = fileType.test(path.extname(file.originalname).toLocaleLowerCase())

        if (mimeType && extname) {
            return cd(null, true)
        }
        return cd(new Error("Error: File upload only supports the following filetypes - " + fileType));
    }
})


export const uploadSingleImage = upload.single("image")