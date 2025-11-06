import { Product } from "../models/productModel.js";
import path from "path"
import fs from "fs"


export const createProduct = async (req, res) => {
    try {
        const { name, description, rating, price } = req.body

        let imagePath;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`
        }

        const product = new Product({
            name, description, price, rating, image: imagePath || null, creator: req.user.id
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

export const updateProduct = async (req, res) => {
    try {

        const { name, description, rating, price } = req.body
        const { id } = req.params
        const existsProduct = await Product.findById(id)
        if (!existsProduct) {
            return res.status(404).json({
                status: 404,
                message: "Product not found",
                data: {}
            })
        }

        let updateData = {
            name, description, price, rating, creator: req.user.id
        };


        const deleteOldImage = async (imagePath) => {
            if (imagePath) {
                const oldFilePath = path.join(process.cwd(), existsProduct.image)

                try {
                    await fs.promises.unlink(oldFilePath)

                } catch (error) {
                    if (err) {
                        console.log("failed to delete old image: ", err)
                    }

                }
            }
        }


        if (req.file) {
            const newImagePath = `/public/uploads/${req.file.filename}`;
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

        return res.status(200).json({
            status: 200,
            message: "update product successfully",
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


export const deleteProduct = async (req, res) => {

    try {
        const { id } = req.params
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({
                status: 404,
                message: "Product not found",
                data: {}
            })
        }

        await Product.findByIdAndDelete(id)
        return res.status(200).json({
            status: 200,
            message: "delete product successfully",
            data: {}
        })

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

export const getAllProducts = async (req, res) => {
    try {

        const products = await Product.find()
            .populate("creator", "name email")
            .sort({ createdAt: -1 })

        if (products.length == 0) {
            return res.status(200).json({
                status: 200,
                message: "No products found",
                data: {}
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "products loaded successfully",
                data: products
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

export const getProduct = async (req, res) => {
    try {

        const { id } = req.params
        const existProduct = await Product.findById(id)
        if (!existProduct) {
            return res.status(404).json({
                status: 404,
                message: "product not found",
                data: {}
            })
        }

        const product = await Product.findById(id).populate("creator", "name email")
        return res.status(200).json({
            status: 200,
            message: "product loaded successfully",
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