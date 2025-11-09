import { Order } from "../models/orderModel.js";
import { OrderHistory } from "../models/orderHistoryModel.js";
import { OrderItem } from "../models/orderItemModel.js";
import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";
import { Topping } from "../models/toppingModel.js";
import { SideOption } from "../models/sideOptionModel.js";
import { catchAsync } from "../utils/catchAsync.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = catchAsync(async (req, res) => {
    const {
        paymentMethod,
        deliveryAddress,
        notes,
        estimatedDeliveryTime
    } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        })
        .populate({
            path: "items",
            populate: {
                path: "toppings",
                model: "Topping"
            }
        })
        .populate({
            path: "items",
            populate: {
                path: "sideOptions",
                model: "SideOption"
            }
        });

    if (!cart || cart.items.length === 0) {
        res.status(400);
        throw new Error("Your cart is empty");
    }

    // Create order items from cart items
    const orderItems = [];
    let totalPrice = 0;

    for (const cartItem of cart.items) {
        // Check if product exists
        if (!cartItem.product) {
            console.error("Product not found in cart item:", cartItem);
            return res.status(400).json({
                status: "error",
                message: "Invalid product in cart",
                data: {}
            });
        }

        // Ensure product has valid ID
        const productId = cartItem.product._id || cartItem.product.id;

        // Get product price
        const productPrice = cartItem.productPrice || cartItem.product.price || 0;
        if (!productId) {
            console.error("Product ID not found in cart item:", cartItem.product);
            return res.status(400).json({
                status: "error",
                message: "Invalid product in cart",
                data: {}
            });
        }

        // Create order item with base product price
        const orderItemData = {
            product: productId,
            quantity: cartItem.quantity || 1,
            price: productPrice,
            spicy: cartItem.spicy || 0,
            toppings: cartItem.toppings ? cartItem.toppings.map(t => t._id || t.id) : [],
            sideOptions: cartItem.sideOptions ? cartItem.sideOptions.map(s => s._id || s.id) : [],
            notes: cartItem.notes || ""
        };

        const orderItem = await OrderItem.create(orderItemData);

        // Create a temporary object for price calculation
        const tempOrderItem = {
            price: productPrice,
            quantity: cartItem.quantity || 1,
            toppings: cartItem.toppings || [],
            sideOptions: cartItem.sideOptions || [],
            spicy: cartItem.spicy || 0
        };

        // Calculate total price using the method from the schema
        const itemTotalPrice = OrderItem.schema.methods.calculateTotalPrice.call(tempOrderItem);

        // Update the orderItem with the calculated price per unit
        orderItem.price = itemTotalPrice / (cartItem.quantity || 1);
        await orderItem.save();

        // Use the actual MongoDB _id for the order items array
        orderItems.push(orderItem._id);
        totalPrice += itemTotalPrice;
    }

    // Check if user exists
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            status: "error",
            message: "User authentication required",
            data: {}
        });
    }

    // Generate order number
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    // Find the highest order number for today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const lastOrder = await Order.findOne({
        createdAt: {
            $gte: todayStart,
            $lt: todayEnd
        }
    }).sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
        const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
        sequence = lastSequence + 1;
    }

    const orderNumber = `ORD-${year}${month}${day}-${sequence.toString().padStart(4, '0')}`;

    // Create the order
    const order = await Order.create({
        user: req.user.id,
        items: orderItems,
        totalPrice,
        paymentMethod,
        deliveryAddress,
        notes,
        estimatedDeliveryTime,
        orderNumber
    });

    // Create initial order history record
    await OrderHistory.create({
        order: order._id,
        status: "pending",
        notes: "Order placed successfully"
    });

    // Clear the cart after order is placed
    await Cart.findOneAndUpdate(
        { user: req.user.id },
        { $set: { items: [] } }
    );

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
        .populate("user", "name email")
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        })
        .populate({
            path: "items",
            populate: {
                path: "toppings",
                model: "Topping"
            }
        })
        .populate({
            path: "items",
            populate: {
                path: "sideOptions",
                model: "SideOption"
            }
        });


    return res.msg(201, "تم انشاء الطلب بنجاح", populatedOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        })
        .populate({
            path: "items",
            populate: {
                path: "toppings",
                model: "Topping"
            }
        })
        .populate({
            path: "items",
            populate: {
                path: "sideOptions",
                model: "SideOption"
            }
        });

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Check if the order belongs to the logged-in user or if user is admin
    const orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();
    const currentUserId = req.user.id.toString();

    if (orderUserId !== currentUserId && !req.user.isAdmin) {
        res.status(401);
        throw new Error("Not authorized to access this order");
    }

    res.json(order);
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = catchAsync(async (req, res) => {
    // Check if user exists
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            status: "error",
            message: "User authentication required",
            data: {}
        });
    }

    const orders = await Order.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .populate("user", "name email");

    res.json(orders);
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = catchAsync(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Order.countDocuments();
    const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate("user", "id name");

    res.json({ orders, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = catchAsync(async (req, res) => {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Create new order history record
    await OrderHistory.create({
        order: order._id,
        status,
        notes: notes || `Order status updated to ${status}`,
        updatedBy: req.user._id
    });

    // Update the order status
    order.status = status;
    await order.save();

    // Get updated order with populated data
    const updatedOrder = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        });

    res.json(updatedOrder);
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = catchAsync(async (req, res) => {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Check if the order belongs to the logged-in user
    const orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();
    const currentUserId = req.user.id.toString();

    if (orderUserId !== currentUserId) {
        res.status(401);
        throw new Error("Not authorized to access this order");
    }

    // Check if order can be cancelled (only pending or processing orders)
    if (!["pending", "processing"].includes(order.status)) {
        res.status(400);
        throw new Error("Cannot cancel order that is already being prepared or delivered");
    }

    // Create new order history record
    await OrderHistory.create({
        order: order._id,
        status: "cancelled",
        notes: reason || "Order cancelled by customer",
        updatedBy: req.user._id
    });

    // Update the order status
    order.status = "cancelled";
    await order.save();

    // Get updated order with populated data
    const updatedOrder = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        });

    res.json(updatedOrder);
});

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
export const updatePaymentStatus = catchAsync(async (req, res) => {
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    // Get updated order with populated data
    const updatedOrder = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        });

    res.json(updatedOrder);
});
