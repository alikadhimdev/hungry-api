import { Product } from "../models/productModel.js";
import path from "path"
import fs from "fs"
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";


export const createProduct = catchAsync(async (req, res, next) => {

    const { name, description, rating, price } = req.body

    let imagePath;
    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`
    }

    const product = new Product({
        name, description, price, rating, image: imagePath, creator: req.user.id
    })
    await product.save();
    res.msg(201, "create product successfully", product, true)


})

export const updateProduct = catchAsync(async (req, res, next) => {

    const { name, description, rating, price } = req.body
    const { id } = req.params
    const existsProduct = await Product.findById(id)
    if (!existsProduct) return next(new AppError("product not found", 404))


    let updateData = {
        name, description, price, rating, creator: req.user.id
    };
    if (req.file) {
        const newImagePath = `/uploads/${req.file.filename}`;
        await deleteOldImage(existsProduct.image)
        updateData.image = newImagePath
    } else if (req.body.deleteImage == "true") {
        await deleteOldImage(existsProduct.image)
        updateData.image = null
    } else {
        updateData.image = existsProduct.image
    }
    const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true
    })

    res.msg(200, "update product successfully", product, true)



})


export const deleteProduct = catchAsync(async (req, res, next) => {

    const { id } = req.params
    const product = await Product.findById(id)
    if (!product) return next(new AppError("product not found", 404))

    if (product.image) {
        await deleteOldImage(product.image)
    }

    await Product.findByIdAndDelete(id)
    res.msg(200, "delete product successfully", {}, true)
})

export const getAllProducts = catchAsync(async (req, res, next) => {


    const products = await Product.find()
        .populate("creator", "name email")
        .sort({ createdAt: -1 })

    const message = products.length ? "products loaded successfully" : "no product found"

    res.msg(200, message, products, true)

})

export const getProduct = catchAsync(
    async (req, res, next) => {
        const { id } = req.params
        const product = await Product.findById(id).populate("creator", "name email")
        if (!product) return next(new AppError(404, "product not found"))
        res.msg(200, "product loaded successfully", product, true)
    }
)



const deleteOldImage = async (imagePath) => {

    if (!imagePath) return
    try {
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

        const filePath = path.join(process.cwd(), "public", cleanPath)
        await fs.promises.unlink(filePath)
    } catch (error) {
        if (error) {
            console.log("failed to delete old image: ", error)
        }
    }
}
