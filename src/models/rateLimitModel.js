import mongoose from "mongoose";

const rateLimitSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        index: true
    },
    attempts: [{
        timestamp: {
            type: Date,
            required: true
        }
    }],
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // TTL index to auto-delete expired documents
    }
}, {
    timestamps: true
});

// Create compound index for faster queries
rateLimitSchema.index({ ip: 1, expiresAt: 1 });

export const RateLimit = mongoose.model("RateLimit", rateLimitSchema);

