import { Item } from "../models/itemModel.js";
import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";
import { Topping } from "../models/toppingModel.js";
import { SideOption } from "../models/sideOptionModel.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

// Function to calculate total price of cart items
function calculateCartTotal(items) {
    return items.reduce((sum, item) => {
        let itemTotal = item.productPrice * item.quantity;

        // Add topping prices
        if (item.toppingPrices && item.toppingPrices.length > 0) {
            item.toppingPrices.forEach(tp => {
                itemTotal += tp.price * item.quantity;
            });
        }

        // Add side option prices
        if (item.sideOptionPrices && item.sideOptionPrices.length > 0) {
            item.sideOptionPrices.forEach(sp => {
                itemTotal += sp.price * item.quantity;
            });
        }

        // Add spicy cost if applicable
        if (item.spicy > 0) {
            itemTotal += itemTotal * item.spicy;
        }

        return sum + itemTotal;
    }, 0);
}

export const addToCard = catchAsync(async (req, res, next) => {
    const { items } = req.body;
    const user = req.user

    if (!items || !Array.isArray(items)) return next(new AppError(400, "يجب توفير مصفوفة من العناصر"))

    let cart = await Cart.findOne({ user: user.id }).populate("items")

    if (!cart) {
        // Create new cart
        cart = new Cart({
            user: user.id,
            items: []
        })
    }

    // Process each item
    for (const itemData of items) {
        // Check if item already exists in cart

        const existItem = cart.items.find(ci => ci.product === itemData.product.toString()
        )

        if (existItem) {
            // Update quantity if item exists
            await Item.findByIdAndUpdate(existItem._id, {
                $inc: { quantity: itemData.quantity || 1 }
            })
        } else {
            // Get product details
            const product = await Product.findById(itemData.product);
            if (!product) return next(new AppError(404, `المنتج ${itemData.product} غير موجود`))

            // Get topping details and prices
            const toppingPrices = [];
            if (itemData.toppings && itemData.toppings.length > 0) {
                for (const toppingId of itemData.toppings) {
                    const topping = await Topping.findById(toppingId);
                    if (topping) {
                        toppingPrices.push({
                            toppingId: topping._id,
                            price: topping.price
                        });
                    }
                }
            }

            // Get side option details and prices
            const sideOptionPrices = [];
            if (itemData.sideOptions && itemData.sideOptions.length > 0) {
                for (const sideOptionId of itemData.sideOptions) {
                    const sideOption = await SideOption.findById(sideOptionId);
                    if (sideOption) {
                        sideOptionPrices.push({
                            sideOptionId: sideOption._id,
                            price: sideOption.price
                        });
                    }
                }
            }

            // Create new item
            const newItem = new Item({
                user: user.id,
                product: itemData.product,
                productPrice: product.price,
                quantity: itemData.quantity || 1,
                spicy: itemData.spicy || 0,
                toppings: itemData.toppings || [],
                toppingPrices,
                sideOptions: itemData.sideOptions || [],
                sideOptionPrices
            });

            await newItem.save();
            cart.items.push(newItem._id);
        }
    }

    await cart.save();

    // Return updated cart
    return getCart(req, res, next);
});

export const getCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate({
        path: "items",
        populate: [
            {
                path: "product",
                select: "-creator -createdAt -updatedAt"
            },
            {
                path: "toppings",
                select: "-createdAt -updatedAt"
            },
            {
                path: "sideOptions",
                select: "-createdAt -updatedAt"
            }
        ]
    });

    if (!cart) {
        return res.msg(200, "ORDER DETAILS LOADED", {
            id: 0,
            total_price: "0.00",
            items: []
        });
    }

    // Format items for response
    const formattedItems = cart.items.map(item => {
        const itemObj = item.toObject();

        // Format the item for the expected response format
        return {
            item_id: itemObj._id.toString(), // Use _id and convert to string
            product_id: itemObj.product._id.toString(), // Use _id for product
            name: itemObj.product.name,
            image: itemObj.product.image,
            quantity: itemObj.quantity,
            price: itemObj.productPrice.toFixed(2),
            spicy: itemObj.spicy.toString(),
            toppings: itemObj.toppings.map(topping => ({
                id: topping._id.toString(), // Use _id for topping
                name: topping.name,
                image: topping.image
            })),
            side_options: itemObj.sideOptions.map(option => ({
                id: option._id.toString(), // Use _id for side option
                name: option.name,
                image: option.image
            }))
        };
    });

    // Calculate total price
    const totalPrice = calculateCartTotal(cart.items);

    return res.msg(200, "ORDER DETAILS LOADED", {
        id: cart._id.toString(), // Use _id for cart and convert to string
        total_price: totalPrice.toFixed(2),
        items: formattedItems
    });
});

export const updateCartItem = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return next(new AppError(400, "يجب تحديد كمية صحيحة"));
    }

    const item = await Item.findById(itemId);
    if (!item) return next(new AppError(404, "العنصر غير موجود"));

    // Check if item belongs to user
    const cart = await Cart.findOne({ user: userId, items: itemId });
    if (!cart) return next(new AppError(403, "غير مصرح لك بتعديل هذا العنصر"));

    // Update quantity
    await Item.findByIdAndUpdate(itemId, { quantity });

    // Return updated cart
    return getCart(req, res, next);
});

export const deleteFromCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const itemId = req.params.id;

    const existItem = await Item.findById(itemId);
    if (!existItem) return next(new AppError(404, "المنتج غير موجود"));

    const cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { items: itemId } },
        { new: true }
    );

    await Item.findByIdAndDelete(itemId);

    // Return updated cart
    return getCart(req, res, next);
});