import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createProduct, deleteProduct, updateProduct, getAllProducts, getProduct } from "../controllers/productController.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";


const route = Router()

route.get("/", authenticateToken, getAllProducts)
route.get("/:id", authenticateToken, getProduct)
route.post("/", authenticateToken, isAdmin, uploadSingleImage, createProduct)
route.put("/:id", authenticateToken, isAdmin, uploadSingleImage, updateProduct)
route.delete("/:id", authenticateToken, isAdmin, deleteProduct)

export default route