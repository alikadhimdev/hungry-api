import dotenv from "dotenv";

// Load environment variables if not already loaded
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'ali-kadhim-secret') {
    throw new Error('JWT_SECRET must be set in environment variables');
}

if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === 'your-refresh-secret') {
    throw new Error('JWT_REFRESH_SECRET must be set in environment variables');
}

// Validate JWT secrets are strong enough (minimum 32 characters in production)
// In development, we allow shorter secrets for convenience
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

export const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
}