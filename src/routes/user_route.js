import { Router } from "express";
import { login, register, profile, updateProfile, logout } from "../controllers/user.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

import multer from "multer";


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const route = Router();

route.get("/profile", authenticateToken, profile)
route.post("/login", login)
route.post("/register", upload.single("image"), register)
route.put("/", authenticateToken, updateProfile)
route.get("/logout", authenticateToken, logout)

export default route;