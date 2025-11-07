import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createProduct, deleteProduct, updateProduct, getAllProducts, getProduct } from "../controllers/productController.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import { checkProductExist } from "../middlewares/checkProductExist.js";


const route = Router()

route.get("/", authenticateToken, getAllProducts)
route.get("/:id", authenticateToken, checkProductExist, getProduct)
route.post("/", authenticateToken, isAdmin, uploadSingleImage, createProduct)
route.put("/:id", authenticateToken, isAdmin, uploadSingleImage, checkProductExist, updateProduct)
route.delete("/:id", authenticateToken, isAdmin, checkProductExist, deleteProduct)

export default route