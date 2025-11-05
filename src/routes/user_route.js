import { Router } from "express";
import { login, register, profile, updateProfile } from "../controllers/user.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const route = Router();

route.get("/", authenticateToken, login)
route.post("/", register)
route.get("/profile", authenticateToken, profile)
route.put("/", authenticateToken, updateProfile)

export default route;