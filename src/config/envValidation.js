import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 * This should be called at application startup
 */
export const validateEnv = () => {
    const requiredEnvVars = [
        'MONGO_URI',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET'
    ];

    const missingVars = [];

    requiredEnvVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}\n` +
            `Please set these variables in your .env file or environment.`
        );
    }

    // Validate JWT secrets strength
    // In production, require 32 characters minimum. In development, allow 8 characters minimum
    const isProduction = process.env.NODE_ENV === 'production';
    const minSecretLength = isProduction ? 32 : 8;

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < minSecretLength) {
        throw new Error(
            `JWT_SECRET must be at least ${minSecretLength} characters long` +
            (isProduction ? ' in production environment' : '')
        );
    }

    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < minSecretLength) {
        throw new Error(
            `JWT_REFRESH_SECRET must be at least ${minSecretLength} characters long` +
            (isProduction ? ' in production environment' : '')
        );
    }

    // Validate MongoDB URI format
    if (process.env.MONGO_URI && !process.env.MONGO_URI.startsWith('mongodb://') && !process.env.MONGO_URI.startsWith('mongodb+srv://')) {
        console.warn('Warning: MONGO_URI does not appear to be a valid MongoDB connection string.');
    }

    // Validate NODE_ENV
    const validEnvs = ['development', 'production', 'test'];
    if (process.env.NODE_ENV && !validEnvs.includes(process.env.NODE_ENV)) {
        console.warn(`Warning: NODE_ENV should be one of: ${validEnvs.join(', ')}. Current value: ${process.env.NODE_ENV}`);
    }

    console.log('✓ Environment variables validated successfully');
};

