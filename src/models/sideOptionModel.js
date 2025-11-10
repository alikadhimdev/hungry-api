import mongoose from "mongoose";

const sideOptionSchema = new mongoose.Schema({
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
    },

}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
})


export const SideOption = mongoose.model("SideOption", sideOptionSchema)
