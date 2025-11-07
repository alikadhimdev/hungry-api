import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";
import { createSideOption, getAllSideOptions, getSideOptionById, updateSideOption, deleteSideOption } from "../controllers/sideOptionController.js";
import { checkSideOptionExist } from "../middlewares/checkSideOptionExist.js";


const route = Router();


route.post(
    "/",
    authenticateToken,
    isAdmin,
    uploadSingleImage,
    checkSideOptionExist,
    createSideOption)

route.get("/", authenticateToken, getAllSideOptions)

route.get("/:id", authenticateToken, getSideOptionById)

route.put(
    "/:id",
    authenticateToken,
    isAdmin,
    uploadSingleImage,
    updateSideOption)

route.delete(
    "/:id",
    authenticateToken,
    isAdmin,
    deleteSideOption)

export default route
