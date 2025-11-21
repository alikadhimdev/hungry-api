import mongoose from "mongoose";

const toppingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    image: {
        type: String,
        default: null
    }

}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;

            if (ret.image && ret.image.startsWith('/')) {
                const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
                ret.image = `${baseUrl}${ret.image}`;
            }
        }
    }
})


export const Topping = mongoose.model("Topping", toppingSchema)