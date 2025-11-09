import mongoose from "mongoose";

const orderHistorySchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "processing", "preparing", "delivering", "completed", "cancelled"],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for id
orderHistorySchema.virtual("id").get(function () {
    return this._id ? this._id.toHexString() : null;
});

// Create indexes for better query performance
orderHistorySchema.index({ order: 1, timestamp: -1 });
orderHistorySchema.index({ status: 1 });
orderHistorySchema.index({ updatedBy: 1 });

export const OrderHistory = mongoose.model("OrderHistory", orderHistorySchema);

