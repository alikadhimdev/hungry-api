import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js"
import { addToCard, getCart, deleteFromCart, updateCartItem } from "../controllers/cartController.js";
const route = Router()

route.post("/", authenticateToken, addToCard)
route.get("/", authenticateToken, getCart)
route.put("/:itemId", authenticateToken, updateCartItem)
route.delete("/:id", authenticateToken, deleteFromCart)

export default route