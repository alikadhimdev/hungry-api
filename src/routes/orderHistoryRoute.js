import express from "express";
import {
    getOrderHistory,
    addOrderHistoryUpdate
} from "../controllers/orderHistoryController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// User routes
router.route("/:orderId").get(authenticateToken, getOrderHistory);

// Admin routes
router.route("/:orderId").post(authenticateToken, isAdmin, addOrderHistoryUpdate);

export default router;
