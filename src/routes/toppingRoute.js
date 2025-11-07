import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";
import { createTopping, getAllToppings, getToppingById, updateTopping, deleteTopping } from "../controllers/toppingController.js";
import { checkToppingExist } from "../middlewares/checkToppingExist.js";


const route = Router();


route.post(
    "/",
    authenticateToken,
    isAdmin,
    uploadSingleImage,
    checkToppingExist,
    createTopping)

route.get("/", authenticateToken, getAllToppings)

route.get("/:id", authenticateToken, getToppingById)

route.put(
    "/:id",
    authenticateToken,
    isAdmin,
    uploadSingleImage,
    updateTopping)

route.delete(
    "/:id",
    authenticateToken,
    isAdmin,
    deleteTopping)

export default route
