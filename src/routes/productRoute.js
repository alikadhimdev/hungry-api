import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createProduct } from "../controllers/productController.js";

const route = Router()

route.post("/", authenticateToken, createProduct)

export default route