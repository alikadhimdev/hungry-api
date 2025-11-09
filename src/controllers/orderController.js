import { Order } from "../models/orderModel.js";
import { OrderHistory } from "../models/orderHistoryModel.js";
import { OrderItem } from "../models/orderItemModel.js";
import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";
import { Topping } from "../models/toppingModel.js";
import { SideOption } from "../models/sideOptionModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import mongoose from "mongoose";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = catchAsync(async (req, res, next) => {
    const {
        paymentMethod,
        deliveryAddress,
        notes,
        estimatedDeliveryTime
    } = req.body;

    // Validate required fields
    if (!paymentMethod) {
        return next(new AppError(400, "طريقة الدفع مطلوبة", "Payment method is required"));
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
        return next(new AppError(400, "عنوان التوصيل مطلوب", "Delivery address is required"));
    }

    // Check if user exists
    if (!req.user || !req.user.id) {
        return next(new AppError(401, "مطلوب مصادقة المستخدم", "User authentication required"));
    }

    // Start database session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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
            })
            .session(session);

        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            return next(new AppError(400, "السلة فارغة", "Your cart is empty"));
        }

        // Create order items from cart items
        const orderItems = [];
        let totalPrice = 0;

        for (const cartItem of cart.items) {
            // Check if product exists
            if (!cartItem.product) {
                await session.abortTransaction();
                return next(new AppError(400, "منتج غير صالح في السلة", "Invalid product in cart"));
            }

            // Ensure product has valid ID
            const productId = cartItem.product._id || cartItem.product.id;

            // Get product price
            const productPrice = cartItem.productPrice || cartItem.product.price || 0;
            if (!productId) {
                await session.abortTransaction();
                return next(new AppError(400, "معرف المنتج غير صالح", "Invalid product ID in cart"));
            }

            // Verify product still exists and is available
            const productExists = await Product.findById(productId).session(session);
            if (!productExists) {
                await session.abortTransaction();
                return next(new AppError(404, `المنتج ${productId} غير موجود`, `Product ${productId} not found`));
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

            const orderItem = await OrderItem.create([orderItemData], { session });

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
            orderItem[0].price = itemTotalPrice / (cartItem.quantity || 1);
            await orderItem[0].save({ session });

            // Use the actual MongoDB _id for the order items array
            orderItems.push(orderItem[0]._id);
            totalPrice += itemTotalPrice;
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
        }).sort({ orderNumber: -1 }).session(session);

        let sequence = 1;
        if (lastOrder && lastOrder.orderNumber) {
            const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
            sequence = lastSequence + 1;
        }

        const orderNumber = `ORD-${year}${month}${day}-${sequence.toString().padStart(4, '0')}`;

        // Create the order
        const order = await Order.create([{
            user: req.user.id,
            items: orderItems,
            totalPrice,
            paymentMethod,
            deliveryAddress,
            notes,
            estimatedDeliveryTime,
            orderNumber
        }], { session });

        // Create initial order history record
        await OrderHistory.create([{
            order: order[0]._id,
            status: "pending",
            notes: "Order placed successfully"
        }], { session });

        // Clear the cart after order is placed
        await Cart.findOneAndUpdate(
            { user: req.user.id },
            { $set: { items: [] } },
            { session }
        );

        // Commit transaction
        await session.commitTransaction();

        // Populate order details for response (outside transaction for better performance)
        const populatedOrder = await Order.findById(order[0]._id)
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
    } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        throw error;
    } finally {
        // End session
        session.endSession();
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = catchAsync(async (req, res, next) => {
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
        return next(new AppError(404, "الطلب غير موجود", "Order not found"));
    }

    // Check if the order belongs to the logged-in user or if user is admin
    const orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();
    const currentUserId = req.user.id.toString();

    if (orderUserId !== currentUserId && !req.user.isAdmin) {
        return next(new AppError(403, "غير مصرح لك بالوصول إلى هذا الطلب", "Not authorized to access this order"));
    }

    return res.msg(200, "تم جلب الطلب بنجاح", order);
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = catchAsync(async (req, res, next) => {
    // Check if user exists
    if (!req.user || !req.user.id) {
        return next(new AppError(401, "مطلوب مصادقة المستخدم", "User authentication required"));
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("user", "name email");

    const total = await Order.countDocuments({ user: req.user.id });

    return res.msg(200, "تم جلب الطلبات بنجاح", {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
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
export const updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ["pending", "processing", "preparing", "delivering", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
        return next(new AppError(400, `الحالة غير صالحة. يجب أن تكون واحدة من: ${validStatuses.join(', ')}`, `Invalid status. Must be one of: ${validStatuses.join(', ')}`));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError(404, "الطلب غير موجود", "Order not found"));
    }

    // Create new order history record
    await OrderHistory.create({
        order: order._id,
        status,
        notes: notes || `Order status updated to ${status}`,
        updatedBy: req.user.id
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

    return res.msg(200, "تم تحديث حالة الطلب بنجاح", updatedOrder);
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = catchAsync(async (req, res, next) => {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError(404, "الطلب غير موجود", "Order not found"));
    }

    // Check if the order belongs to the logged-in user
    const orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();
    const currentUserId = req.user.id.toString();

    if (orderUserId !== currentUserId) {
        return next(new AppError(403, "غير مصرح لك بإلغاء هذا الطلب", "Not authorized to cancel this order"));
    }

    // Check if order can be cancelled (only pending or processing orders)
    if (!["pending", "processing"].includes(order.status)) {
        return next(new AppError(400, "لا يمكن إلغاء الطلب الذي تم تحضيره أو تسليمه بالفعل", "Cannot cancel order that is already being prepared or delivered"));
    }

    // Create new order history record
    await OrderHistory.create({
        order: order._id,
        status: "cancelled",
        notes: reason || "Order cancelled by customer",
        updatedBy: req.user.id
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

    return res.msg(200, "تم إلغاء الطلب بنجاح", updatedOrder);
});

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
export const updatePaymentStatus = catchAsync(async (req, res, next) => {
    const { paymentStatus } = req.body;

    // Validate payment status
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];
    if (!paymentStatus || !validPaymentStatuses.includes(paymentStatus)) {
        return next(new AppError(400, `حالة الدفع غير صالحة. يجب أن تكون واحدة من: ${validPaymentStatuses.join(', ')}`, `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError(404, "الطلب غير موجود", "Order not found"));
    }

    // Check if the order belongs to the logged-in user or if user is admin
    const orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();
    const currentUserId = req.user.id.toString();

    if (orderUserId !== currentUserId && !req.user.isAdmin) {
        return next(new AppError(403, "غير مصرح لك بتحديث حالة الدفع لهذا الطلب", "Not authorized to update payment status for this order"));
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

    return res.msg(200, "تم تحديث حالة الدفع بنجاح", updatedOrder);
});
