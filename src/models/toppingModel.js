import mongoose from "mongoose";

const toppingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        default: null
    }

}, {
    timeseries: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
})

export const Topping = mongoose.model("Topping", toppingSchema)