import { User } from "../models/userModel.js"
import { Product } from "../models/productModel.js"
import { Favorite } from "../models/favoriteModel.js"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"

export const addFavorite = catchAsync(async (req, res, next) => {
    try {
        const { id } = req.params
        const user = req.user
        const product = await Product.findById(id)

        if (!product) {
            return next(new AppError("Product not found", 404))
        }
        if (!user.id) {
            return next(new AppError("User not found", 404))
        }
        const alreadyExistFavorite = await Favorite.findOne({
            userId: user.id,
            productId: product.id
        });


        if (alreadyExistFavorite) {
            await Favorite.findOneAndDelete({ userId: existUser.id, productId: product.id })
            return res.status(200).json({
                status: 200,
                message: "favorite removed successfully",
                data: {}
            })

        } else {
            const favorite = new Favorite({
                userId: existUser.id,
                productId: product.id
            })

            await favorite.save()

            return res.status(201).send({
                status: 201,
                message: "favorite added successfully",
                data: favorite
            })
        }



    } catch (error) {
        return next(new AppError(error.message, 500))
    }
})

export const getFavorites = catchAsync(async (req, res, next) => {
    try {
        const user = req.user
        const favorites = await Favorite.find({ userId: user.id.id }).populate({
            path: 'productId',
            select: "-creator"
        })
        return res.status(200).send({
            status: 200,
            message: "favorites retrieved successfully",
            data: favorites
        })

    } catch (error) {
        return next(AppError(error.message, 500))
    }
})