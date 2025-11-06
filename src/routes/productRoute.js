import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createProduct, deleteProduct, updateProduct, getAllProducts, getProduct } from "../controllers/productController.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";


const route = Router()

route.get("/", authenticateToken, getAllProducts)
route.get("/:id", authenticateToken, getProduct)
route.post("/", authenticateToken, uploadSingleImage, createProduct)
route.put("/:id", authenticateToken, uploadSingleImage, updateProduct)
route.delete("/:id", authenticateToken, deleteProduct)

export default route