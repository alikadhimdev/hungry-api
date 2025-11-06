import { Product } from "../models/productModel.js"
import { Favorite } from "../models/favoriteModel.js"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"

export const addFavorite = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const user = req.user
    const product = await Product.findById(id)

    if (!product) return next(new AppError("Product not found", 404))

    if (!user?.id) return next(new AppError("User not found", 404))

    const alreadyExistFavorite = await Favorite.findOne({
        userId: user.id,
        productId: product.id
    });
    if (alreadyExistFavorite) {
        await Favorite.deleteOne({ userId: user.id, productId: product.id })
        res.msg(200, "favorite removed successfully")
    } else {
        const favorite = new Favorite({
            userId: user.id,
            productId: product.id
        })
        await favorite.save()
        res.msg(201, "favorite added successfully")

    }
})

export const getFavorites = catchAsync(async (req, res, next) => {
    const user = req.user
    if (!user?.id) return next(new AppError("User not found", 404))

    const favorites = await Favorite.find({ userId: user.id }).populate({
        path: 'productId',
        select: "-creator"
    }).sort({ createdAt: -1 })
    res.msg(200, "favorites retrieved successfully", favorites)
})