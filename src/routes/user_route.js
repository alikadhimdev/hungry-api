import { Router } from "express";
import { login, register, profile, updateProfile, logout } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";


const route = Router();

route.get("/profile", authenticateToken, profile)
route.post("/login", login)
route.post("/register", uploadSingleImage, register)
route.put("/update", authenticateToken, uploadSingleImage, updateProfile)
route.get("/logout", authenticateToken, logout)

export default route;