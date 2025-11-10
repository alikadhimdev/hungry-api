import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },
        phone: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false // Don't return password by default
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

// Create indexes for better query performance
userSchema.index({ isAdmin: 1 });

export const User = mongoose.model("User", userSchema);