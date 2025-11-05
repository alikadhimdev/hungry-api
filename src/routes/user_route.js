import { Router } from "express";
import { login, register } from "../controllers/user.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const route = Router();

route.get("/", authenticateToken, login)
route.post("/", register)

export default route;