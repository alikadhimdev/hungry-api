import mongoose from "mongoose";
import { User } from "./userModel.js";


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    description: {
        type: String,
    },
    rating: {
        type: Number,
        require: true,
        default: 0
    },
    price: {
        type: Number,
        require: true,
        default: 0
    },
    image: {
        type: String,
        default: null,
    },
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: User,
        require: true
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

// Create indexes for better query performance
productSchema.index({ creator: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

export const Product = mongoose.model("Product", productSchema);