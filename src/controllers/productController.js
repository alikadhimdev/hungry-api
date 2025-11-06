import { Product } from "../models/productModel.js";



export const createProduct = async (req, res) => {
    if (!req.user.isAdmin) {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                status: 403,
                message: "Unauthorized",
                data: {}
            })
        }
    }
    try {
        const { name, description, rating, price } = req.body

        const product = new Product({
            name, description, price, rating, creator: req.user.id
        })
        await product.save();
        return res.status(201).json({
            status: 201,
            message: "create product successfully",
            data: product
        })

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}
