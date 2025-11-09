import express from "express";
import {
    createOrder,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    cancelOrder,
    updatePaymentStatus
} from "../controllers/orderController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// User routes
router.route("/").post(authenticateToken, createOrder);
router.route("/myorders").get(authenticateToken, getMyOrders);
router.route("/:id").get(authenticateToken, getOrderById);
router.route("/:id/cancel").put(authenticateToken, cancelOrder);
router.route("/:id/payment").put(authenticateToken, updatePaymentStatus);

// Admin routes
router.route("/").get(authenticateToken, isAdmin, getOrders);
router.route("/:id/status").put(authenticateToken, isAdmin, updateOrderStatus);

export default router;
