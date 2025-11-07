import { AppError } from "../utils/appError.js"
import { Product } from "../models/productModel.js";
import { catchAsync } from "../utils/catchAsync.js";

export const checkProductExist = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError(404, "المنتج غير موجود"));
    req.product = product;
    next()
})