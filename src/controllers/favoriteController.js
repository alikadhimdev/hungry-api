import { User } from "../models/userModel.js"
import { Product } from "../models/productModel.js"
import { Favorite } from "../models/favoriteModel.js"


export const addFavorite = async (req, res) => {
    try {
        const { id } = req.params
        const user = req.user
        const product = await Product.findById(id)
        const existUser = await User.findById(user.id)

        if (!existUser || !product) {
            return res.status(404).send({
                status: 404,
                message: "User or Product not found",
                data: {}
            })
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
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

export const getFavorites = async (req, res) => {
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
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}