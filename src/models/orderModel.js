import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem"
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "processing", "preparing", "delivering", "completed", "cancelled"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "credit_card", "digital_wallet"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    deliveryAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: "Jordan"
        },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    deliveryTime: {
        type: Date,
        default: Date.now
    },
    estimatedDeliveryTime: {
        type: Date
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Generate a unique order number before saving
orderSchema.pre('save', async function (next) {
    // Only generate orderNumber if it's a new document and orderNumber is not already set
    if (this.isNew && !this.orderNumber) {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');

        // Find the highest order number for today
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const Order = mongoose.model("Order");
        const lastOrder = await Order.findOne({
            createdAt: {
                $gte: todayStart,
                $lt: todayEnd
            }
        }).sort({ orderNumber: -1 });

        let sequence = 1;
        if (lastOrder && lastOrder.orderNumber) {
            const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
            sequence = lastSequence + 1;
        }

        this.orderNumber = `ORD-${year}${month}${day}-${sequence.toString().padStart(4, '0')}`;
    }
    next();
});

// Handle errors
orderSchema.post('save', function (error, doc, next) {
    if (error.name === 'ValidationError' && error.errors.orderNumber) {
        // Generate a new orderNumber if there's a duplicate
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `ORD-${year}${month}${day}-${random}`;
        return this.save().then(() => next()).catch(err => next(err));
    }
    next(error);
});

// Virtual field for id
orderSchema.virtual("id").get(function () {
    return this._id ? this._id.toHexString() : null;
});

// Create indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

export const Order = mongoose.model("Order", orderSchema);

