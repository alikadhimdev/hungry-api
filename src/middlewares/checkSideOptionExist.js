import { SideOption } from "../models/sideOptionModel.js";
import { AppError } from "../utils/appError.js";

export const checkSideOptionExist = async (req, res, next) => {
    const { name } = req.body;
    const sideOption = await SideOption.findOne({ name });
    if (sideOption) {
        return next(new AppError(400, `Side option ${name} exists, choose another name`))
    }
    next();
}
