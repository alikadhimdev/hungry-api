import express from "express";
import {
    getOrderHistory,
    addOrderHistoryUpdate
} from "../controllers/orderHistoryController.js";
import { authenticateToken, requireOwnership } from "../middlewares/authMiddleware.js";
import { requireAdminPermission } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// User routes - can only access their own order history
router.route("/:orderId").get(authenticateToken, requireOwnership('orderId'), getOrderHistory);

// Admin routes - can update any order's history
router.route("/:orderId").post(authenticateToken, requireAdminPermission("update:order_history"), addOrderHistoryUpdate);

export default router;
