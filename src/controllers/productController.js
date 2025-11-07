import { Product } from "../models/productModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import { processImageCreation, processImageUpdate, processImageDeletion } from "../services/imageService.js";

export const createProduct = catchAsync(async (req, res, next) => {
    const { name, description, rating, price } = req.body;
    // معالجة الصورة
    const imagePath = await processImageCreation(req);

    const product = new Product({
        name,
        description,
        price,
        rating,
        image: imagePath,
        creator: req.user.id
    });

    await product.save();
    res.msg(201, "تم إنشاء المنتج بنجاح", product, true);
});

export const updateProduct = catchAsync(async (req, res, next) => {
    const { name, description, rating, price } = req.body;

    const product = req.product
    const imageResult = await processImageUpdate(req, product.image);

    let updateData = {
        name,
        description,
        price,
        rating,
        creator: req.user.id,
        image: imageResult.image
    };

    await Product.findByIdAndUpdate(product.id, updateData, {
        new: true
    });

    const newProduct = await Product.findById(product.id);
    res.msg(200, "تم تحديث المنتج بنجاح", newProduct, true);
});

export const deleteProduct = catchAsync(async (req, res) => {

    const product = req.product;
    await processImageDeletion(product.image);
    await Product.findByIdAndDelete(product.id);
    res.msg(200, "تم حذف المنتج بنجاح", {}, true);
});

export const getAllProducts = catchAsync(async (req, res) => {
    const products = await Product.find()
        .populate("creator", "name email")
        .sort({ createdAt: -1 });
    const message = products.length ? "تم تحميل المنتجات بنجاح" : "لا توجد منتجات";
    res.msg(200, message, products, true);
});

export const getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.product.id).populate("creator", "name email");
    res.msg(200, "تم تحميل المنتج بنجاح", product, true);
});
