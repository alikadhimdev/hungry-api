import { Topping } from "../models/toppingModel.js";
import { AppError } from "../utils/appError.js";

export const checkToppingExist = async (req, res, next) => {
    const { name } = req.body;
    const topping = await Topping.findOne({ name });
    if (topping) {
        return next(new AppError(400, `Topping ${name} exists chose another name`))
    }
    next();
}
