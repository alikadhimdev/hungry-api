import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    spicy: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
    },
    toppings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topping"
    }],
    sideOptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SideOption"
    }],
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for id
orderItemSchema.virtual("id").get(function() {
    return this._id ? this._id.toHexString() : "";
});

// Calculate the total price for this order item
orderItemSchema.methods.calculateTotalPrice = function() {
    // Ensure price and quantity are valid numbers
    const price = typeof this.price === "number" ? this.price : 0;
    const quantity = typeof this.quantity === "number" ? this.quantity : 1;
    
    let total = price * quantity;

    // Add toppings price
    if (this.toppings && Array.isArray(this.toppings) && this.toppings.length > 0) {
        this.toppings.forEach(topping => {
            // Handle both object and ID cases
            const toppingPrice = typeof topping === "object" ? 
                (topping.price || 0) : 
                0; // If it's just an ID, we can't get price
                
            if (toppingPrice > 0) {
                total += toppingPrice * quantity;
            }
        });
    }

    // Add side options price
    if (this.sideOptions && Array.isArray(this.sideOptions) && this.sideOptions.length > 0) {
        this.sideOptions.forEach(sideOption => {
            // Handle both object and ID cases
            const sideOptionPrice = typeof sideOption === "object" ? 
                (sideOption.price || 0) : 
                0; // If it's just an ID, we can't get price
                
            if (sideOptionPrice > 0) {
                total += sideOptionPrice * quantity;
            }
        });
    }

    return total;
};

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);
