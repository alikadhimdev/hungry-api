import { processImageCreation, processImageUpdate, processImageDeletion } from "../services/imageService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { Topping } from "../models/toppingModel.js"
import { toppingsValidation } from "../validations/toppingsValidation.js";
import { AppError } from "../utils/appError.js";

export const createTopping = catchAsync(async (req, res, next) => {
    const { error } = toppingsValidation.validate(req.body)

    if (error) return next(new AppError(400, error.details[0].message))

    const { name } = req.body
    const { imagePath } = await processImageCreation(req)

    const topping = await Topping.create({ name, image: imagePath })
    return res.msg(201, "topping create successfully", topping)
})

export const getAllToppings = catchAsync(async (req, res, next) => {
    const toppings = await Topping.find()
    return res.msg(200, "toppings loaded", toppings)
})

export const getToppingById = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const topping = await Topping.findById(id)
    if (!topping) {
        return next(new AppError(404, "Topping not found"))
    }
    return res.msg(200, "topping", topping)
})

export const updateTopping = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const { name } = req.body

    const topping = await Topping.findById(id)
    if (!topping) {
        return next(new AppError(404, "Topping not found"))
    }

    // Check if name is already used by another topping
    if (name && name !== topping.name) {
        const existingTopping = await Topping.findOne({ name })
        if (existingTopping) {
            return next(new AppError(400, `Topping with name ${name} already exists`))
        }
    }

    // Process image update
    const imageResult = await processImageUpdate(req, topping.image)

    // Update topping data
    topping.name = name || topping.name
    topping.image = imageResult.image

    await topping.save()

    return res.msg(200, "topping updated successfully", topping)
})

export const deleteTopping = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const topping = await Topping.findById(id)
    if (!topping) {
        return next(new AppError(404, "Topping not found"))
    }

    // Delete the image if exists
    await processImageDeletion(topping.image)

    // Delete the topping
    await Topping.findByIdAndDelete(id)

    return res.msg(200, "topping deleted successfully")
})