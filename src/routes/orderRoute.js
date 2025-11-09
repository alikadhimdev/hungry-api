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
import { authenticateToken, requireOwnership } from "../middlewares/authMiddleware.js";
import { isAdmin, requireAdminPermission } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// User routes
router.route("/").post(authenticateToken, createOrder);
router.route("/myorders").get(authenticateToken, getMyOrders);
router.route("/:id").get(authenticateToken, requireOwnership('id'), getOrderById);
router.route("/:id/cancel").put(authenticateToken, requireOwnership('id'), cancelOrder);
router.route("/:id/payment").put(authenticateToken, requireOwnership('id'), updatePaymentStatus);

// Admin routes
router.route("/").get(authenticateToken, requireAdminPermission("read:orders"), getOrders);
router.route("/:id/status").put(authenticateToken, requireAdminPermission("update:order_status"), updateOrderStatus);

export default router;
