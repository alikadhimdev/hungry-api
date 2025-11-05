import { Router } from "express";
import { login, register, profile } from "../controllers/user.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const route = Router();

route.get("/", authenticateToken, login)
route.post("/", register)
route.get("/profile", authenticateToken, profile)

export default route;