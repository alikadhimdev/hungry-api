import { Router } from "express";
import { addFavorite, getFavorites } from "../controllers/favoriteController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const route = Router()

route.post("/:id", authenticateToken, addFavorite)
route.get("/", authenticateToken, getFavorites)

export default route;

