import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/categoryController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const route = Router()

route.post("/", authenticateToken, createCategory)
route.get("/", getAllCategories)
route.delete("/:id", authenticateToken, deleteCategory)
route.put("/:id", authenticateToken, updateCategory)

export default route;