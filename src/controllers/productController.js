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
    const { id } = req.params;

    const existsProduct = await Product.findById(id);
    if (!existsProduct) return next(new AppError("المنتج غير موجود", 404));

    // معالجة الصورة
    const imageResult = await processImageUpdate(req, existsProduct.image);

    let updateData = {
        name,
        description,
        price,
        rating,
        creator: req.user.id,
        image: imageResult.image
    };

    const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true
    });

    res.msg(200, "تم تحديث المنتج بنجاح", product, true);
});

export const deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new AppError("المنتج غير موجود", 404));

    // حذف الصورة المرتبطة بالمنتج
    await processImageDeletion(product.image);

    await Product.findByIdAndDelete(id);
    res.msg(200, "تم حذف المنتج بنجاح", {}, true);
});

export const getAllProducts = catchAsync(async (req, res, next) => {
    const products = await Product.find()
        .populate("creator", "name email")
        .sort({ createdAt: -1 });

    const message = products.length ? "تم تحميل المنتجات بنجاح" : "لا توجد منتجات";

    res.msg(200, message, products, true);
});

export const getProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate("creator", "name email");
    if (!product) return next(new AppError(404, "المنتج غير موجود"));
    res.msg(200, "تم تحميل المنتج بنجاح", product, true);
});
