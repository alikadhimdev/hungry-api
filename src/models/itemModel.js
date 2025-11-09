import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    // Store product price at time of adding to cart
    productPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    spicy: {
        type: Number,
        default: 0
    },
    toppings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Topping",
            default: null
        }
    ],
    // Store topping prices at time of adding to cart
    toppingPrices: [{
        toppingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Topping"
        },
        price: {
            type: Number,
            required: true,
            default: 0
        }
    }],
    sideOptions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SideOption",
            default: null
        }
    ],
    // Store side option prices at time of adding to cart
    sideOptionPrices: [{
        sideOptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SideOption"
        },
        price: {
            type: Number,
            required: true,
            default: 0
        }
    }]
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

// Virtual field for calculating item total price
itemSchema.virtual('total_price').get(function() {
    let total = this.productPrice * this.quantity;

    // Add topping prices
    this.toppingPrices.forEach(tp => {
        total += tp.price * this.quantity;
    });

    // Add side option prices
    this.sideOptionPrices.forEach(sp => {
        total += sp.price * this.quantity;
    });

    // Add spicy cost if applicable
    if (this.spicy > 0) {
        total += total * this.spicy;
    }

    return total;
});

// Create indexes for better query performance
itemSchema.index({ product: 1 });
itemSchema.index({ user: 1 });

export const Item = mongoose.model("Item", itemSchema)



