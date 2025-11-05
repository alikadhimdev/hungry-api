import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String
        },
        password: {
            type: String,
            required: true,
        },
        image: {
            data: Buffer,
            contentType: String
        },
        isAdmin: {
            type: Boolean,
            default: false,
        }
    }
    ,
    {
        timestamps: true
    }
)

export const User = mongoose.model("User", userSchema);