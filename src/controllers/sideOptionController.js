import { processImageCreation, processImageUpdate, processImageDeletion } from "../services/imageService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { SideOption } from "../models/sideOptionModel.js"
import { sideOptionValidation } from "../validations/sideOptionValidation.js";
import { AppError } from "../utils/appError.js";

export const createSideOption = catchAsync(async (req, res, next) => {
    const { error } = sideOptionValidation.validate(req.body)

    if (error) return next(new AppError(400, error.details[0].message))

    const { name, price } = req.body

    const { imagePath } = await processImageCreation(req)

    const sideOption = await SideOption.create({ name, price, image: imagePath })
    return res.msg(201, "side option created successfully", sideOption)
})

export const getAllSideOptions = catchAsync(async (req, res, next) => {
    const sideOptions = await SideOption.find()
    return res.msg(200, "side options", sideOptions)
})

export const getSideOptionById = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const sideOption = await SideOption.findById(id)
    if (!sideOption) {
        return next(new AppError(404, "Side option not found"))
    }

    return res.msg(200, "side option", sideOption)
})

export const updateSideOption = catchAsync(async (req, res, next) => {
    const { id } = req.params


    const { name, price } = req.body

    const sideOption = await SideOption.findById(id)
    if (!sideOption) {
        return next(new AppError(404, "Side option not found"))
    }

    // Check if name is already used by another side option
    if (name && name !== sideOption.name) {
        const existingSideOption = await SideOption.findOne({ name })
        if (existingSideOption) {
            return next(new AppError(400, `Side option with name ${name} already exists`))
        }
    }

    // Process image update
    const imageResult = await processImageUpdate(req, sideOption.image)

    // Update side option data
    sideOption.name = name || sideOption.name
    sideOption.price = price !== undefined ? price : sideOption.price
    sideOption.image = imageResult.image

    await sideOption.save()

    return res.msg(200, "side option updated successfully", sideOption)
})

export const deleteSideOption = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const sideOption = await SideOption.findById(id)
    if (!sideOption) {
        return next(new AppError(404, "Side option not found"))
    }

    // Delete the image if exists
    await processImageDeletion(sideOption.image)

    // Delete the side option
    await SideOption.findByIdAndDelete(id)

    return res.msg(200, "side option deleted successfully")
})
