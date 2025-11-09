import { ERROR_TYPES, getErrorType } from './errorTypes.js';

export class AppError extends Error {
    constructor(statusCode, message, type = null, details = null, isArabic = false) {
        super(message);

        // If type is provided, use it, otherwise determine from status code
        const errorType = type ? ERROR_TYPES[type] : getErrorType(statusCode);

        this.statusCode = statusCode;
        this.type = errorType.type;
        this.status = errorType.code < 500 ? 'fail' : 'error';
        this.isOperational = true;
        this.logLevel = errorType.logLevel;
        this.isClientError = errorType.isClientError;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Add Arabic message if available
        if (errorType.arabicMessage) {
            this.arabicMessage = errorType.arabicMessage;
        }

        // Store language preference
        this.isArabic = isArabic;

        // Set appropriate message based on language
        if (isArabic && this.arabicMessage && !message) {
            this.message = this.arabicMessage;
        }
    }

    // Get localized message based on language preference
    getLocalizedMessage() {
        return this.isArabic && this.arabicMessage ? this.arabicMessage : this.message;
    }
}

// Factory functions for common error types
export const createBadRequestError = (message, details = null, isArabic = false) => {
    return new AppError(400, message, 'BAD_REQUEST', details, isArabic);
};

export const createUnauthorizedError = (message, details = null, isArabic = false) => {
    return new AppError(401, message, 'UNAUTHORIZED', details, isArabic);
};

export const createForbiddenError = (message, details = null, isArabic = false) => {
    return new AppError(403, message, 'FORBIDDEN', details, isArabic);
};

export const createNotFoundError = (message, details = null, isArabic = false) => {
    return new AppError(404, message, 'NOT_FOUND', details, isArabic);
};

export const createConflictError = (message, details = null, isArabic = false) => {
    return new AppError(409, message, 'CONFLICT', details, isArabic);
};

export const createValidationError = (message, details = null, isArabic = false) => {
    return new AppError(422, message, 'VALIDATION_ERROR', details, isArabic);
};

export const createTooManyRequestsError = (message, details = null, isArabic = false) => {
    return new AppError(429, message, 'TOO_MANY_REQUESTS', details, isArabic);
};

export const createInternalServerError = (message, details = null, isArabic = false) => {
    return new AppError(500, message, 'INTERNAL_SERVER_ERROR', details, isArabic);
};

export const createDatabaseError = (message, details = null, isArabic = false) => {
    return new AppError(500, message, 'DATABASE_ERROR', details, isArabic);
};

export const createExternalServiceError = (message, details = null, isArabic = false) => {
    return new AppError(502, message, 'EXTERNAL_SERVICE_ERROR', details, isArabic);
};

export const createServiceUnavailableError = (message, details = null, isArabic = false) => {
    return new AppError(503, message, 'SERVICE_UNAVAILABLE', details, isArabic);
};

// Helper function to check if request prefers Arabic
export const isArabicRequest = (req) => {
    const acceptLanguage = req.headers['accept-language'];
    return acceptLanguage && (acceptLanguage.includes('ar') || acceptLanguage.includes('ar-SA'));
};

// Helper function to create error with appropriate language
export const createLocalizedError = (statusCode, message, type = null, details = null, req = null) => {
    const isArabic = isArabicRequest(req);
    return new AppError(statusCode, message, type, details, isArabic);
};