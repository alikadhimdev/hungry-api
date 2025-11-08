import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
        }
    ]
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

// Virtual field for calculating total price (not saved in DB)
cartSchema.virtual('total_price').get(function() {
    return 0; // Will be calculated dynamically in controller
});

export const Cart = mongoose.model("Cart", cartSchema)
