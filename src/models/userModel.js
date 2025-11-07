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
            type: String,
            default: null,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        }
    }
    ,
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    }
)

export const User = mongoose.model("User", userSchema);