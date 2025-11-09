import { logError } from "../utils/errorLogger.js";
import { AppError } from "../utils/appError.js";

// Handle MongoDB duplicate key errors
const handleDuplicateKeyError = (err, req) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

    const message = isArabic 
        ? `قيمة مكررة: ${value}. يرجى استخدام قيمة أخرى للحققل ${field}.` 
        : `Duplicate field value: ${value}. Please use another value for ${field}.`;

    return new AppError(400, message, 'CONFLICT', null, isArabic);
};

// Handle MongoDB validation errors
const handleValidationError = (err, req) => {
    const errors = Object.values(err.errors).map(val => val.message);
    const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

    const message = isArabic 
        ? `بيانات إدخال غير صالحة. ${errors.join('. ')}` 
        : `Invalid input data. ${errors.join('. ')}`;

    return new AppError(400, message, 'VALIDATION_ERROR', errors, isArabic);
};

// Handle MongoDB cast errors
const handleCastError = (err, req) => {
    const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

    const message = isArabic 
        ? `قيمة غير صالحة لـ ${err.path}: ${err.value}.` 
        : `Invalid ${err.path}: ${err.value}.`;

    return new AppError(400, message, 'VALIDATION_ERROR', null, isArabic);
};

// Handle JWT errors
const handleJWTError = (req) => {
    const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

    const message = isArabic 
        ? 'رمز غير صالح. يرجى تسجيل الدخول مرة أخرى.' 
        : 'Invalid token. Please log in again.';

    return new AppError(401, message, 'UNAUTHORIZED', null, isArabic);
};

const handleJWTExpiredError = (req) => {
    const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

    const message = isArabic 
        ? 'انتهت صلاحية الرمز. يرجى تسجيل الدخول مرة أخرى.' 
        : 'Your token has expired. Please log in again.';

    return new AppError(401, message, 'UNAUTHORIZED', null, isArabic);
};

// Send error response in development
const sendErrorDev = (err, res) => {
    // Check if client prefers Arabic
    const isArabic = err.isArabic || (res.req && res.req.headers && (res.req.headers['accept-language'] && (res.req.headers['accept-language'].includes('ar') || res.req.headers['accept-language'].includes('ar-SA'))));

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: isArabic && err.arabicMessage ? err.arabicMessage : err.message,
        stack: err.stack,
        type: err.type,
        details: err.details,
        timestamp: err.timestamp
    });
};

// Send error response in production
const sendErrorProd = (err, res) => {
    // Check if client prefers Arabic
    const isArabic = err.isArabic || (res.req && res.req.headers && (res.req.headers['accept-language'] && (res.req.headers['accept-language'].includes('ar') || res.req.headers['accept-language'].includes('ar-SA'))));

    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: isArabic && err.arabicMessage ? err.arabicMessage : err.message,
            type: err.type,
            ...(err.details && { details: err.details })
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);

        res.status(500).json({
            status: 'error',
            message: isArabic ? 'حدث خطأ ما!' : 'Something went wrong!',
            type: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Check if client prefers Arabic
    const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

    // Log the error
    logError(error, req);

    // Handle specific error types
    if (err.code === 11000) error = handleDuplicateKeyError(err, req);
    if (err.name === 'ValidationError') error = handleValidationError(err, req);
    if (err.name === 'CastError') error = handleCastError(err, req);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(req);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(req);

    // If error is not an AppError, convert it to one
    if (!(error instanceof AppError)) {
        error = new AppError(
            error.statusCode || 500,
            error.message || (isArabic ? 'حدث خطأ ما!' : 'Something went wrong!'),
            null,
            process.env.NODE_ENV === 'development' ? error.stack : null,
            isArabic
        );
    }

    // Send error response based on environment
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else {
        sendErrorProd(error, res);
    }
};

// Handle unhandled promise rejections
export const handleUnhandledRejection = (process) => {
    process.on('unhandledRejection', (err) => {
        console.log('UNHANDLED REJECTION! 💥 Shutting down...');
        console.log(err.name, err.message);

        // Log the error
        logError(err, { 
            ip: 'SERVER', 
            method: 'UNHANDLED_REJECTION', 
            originalUrl: 'N/A',
            get: () => 'SERVER'
        });

        process.exit(1);
    });
};

// Handle uncaught exceptions
export const handleUncaughtException = (process) => {
    process.on('uncaughtException', (err) => {
        console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
        console.log(err.name, err.message);

        // Log the error
        logError(err, { 
            ip: 'SERVER', 
            method: 'UNCAUGHT_EXCEPTION', 
            originalUrl: 'N/A',
            get: () => 'SERVER'
        });

        process.exit(1);
    });
};