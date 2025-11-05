import { Category } from "../models/categoryModel.js";


export const createCategory = async (req, res) => {

    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                status: 403,
                message: "Unauthorized",
                data: {}
            })
        }
        const { name } = req.body;
        if (!name || name == null) {
            return res.status(400).json({
                status: 400,
                message: "category name is required",
                data: {}
            })
        }
        const category = new Category({
            name
        })

        await category.save()

        return res.status(201).json({
            status: 201,
            message: "create category successfully",
            data: category
        })

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

export const getAllCategories = async (req, res) => {

    try {
        const allCategories = await Category.find()

        if (allCategories.length == 0) {
            return res.status(200).json({
                status: 200,
                message: "no category found",
                data: {}
            })
        }

        return res.status(200).json({
            status: 200,
            message: "get all categories successfully",
            data: allCategories
        })

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

export const updateCategory = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                status: 403,
                message: "Unauthorized",
                data: {}
            })
        }
        const { name } = req.body;
        const { id } = req.params;

        if (!id || id == null || ! await Category.findById(id)) {
            return res.status(404).json({
                status: 404,
                message: "category not found",
                data: {}
            })
        }

        if (name == undefined || !name) {
            return res.status(400).json({
                status: 400,
                message: "category name is required",
                data: {}
            })
        }


        const updated = await Category.findByIdAndUpdate(id,
            { name }, { new: true }
        )

        return res.status(201).json({
            status: 201,
            message: "category update successfully",
            data: updated
        })

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}
export const deleteCategory = async (req, res) => {

    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                status: 403,
                message: "Unauthorized",
                data: {}
            })
        }
        const { id } = req.params

        if (!id || id == null || ! await Category.findById(id)) {
            return res.status(404).json({
                status: 404,
                message: "category not found",
                data: {}
            })
        }

        await Category.findByIdAndDelete(id)
        return res.status(200).json({
            status: 200,
            message: "category delete successfully",
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

