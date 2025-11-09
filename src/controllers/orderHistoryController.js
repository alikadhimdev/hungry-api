import { Order } from "../models/orderModel.js";
import { OrderHistory } from "../models/orderHistoryModel.js";
import { catchAsync } from "../utils/catchAsync.js";

// @desc    Get order history/tracking
// @route   GET /api/order-history/:orderId
// @access  Private
export const getOrderHistory = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.orderId).select("orderNumber status user");

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Check if the order belongs to the logged-in user or if user is admin
    const orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();
    const currentUserId = req.user._id ? req.user._id.toString() : req.user.id.toString();

    if (orderUserId !== currentUserId && !req.user.isAdmin) {
        res.status(401);
        throw new Error("Not authorized to access this order");
    }

    // Get order history from OrderHistory collection
    const orderHistory = await OrderHistory.find({ order: req.params.orderId })
        .sort({ timestamp: 1 });

    res.json({
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        trackingHistory: orderHistory
    });
});

// @desc    Add update to order history
// @route   POST /api/order-history/:orderId
// @access  Private/Admin
export const addOrderHistoryUpdate = catchAsync(async (req, res) => {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Create new order history record
    const newHistoryEntry = new OrderHistory({
        order: req.params.orderId,
        status,
        notes: notes || `Order status updated to ${status}`,
        updatedBy: req.user._id
    });

    await newHistoryEntry.save();

    // Update the order status if provided
    if (status) {
        order.status = status;
        await order.save();
    }

    // Get updated history
    const updatedHistory = await OrderHistory.find({ order: req.params.orderId })
        .sort({ timestamp: 1 });

    res.json({
        message: "Order history updated successfully",
        trackingHistory: updatedHistory,
        currentStatus: order.status
    });
});
