import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ROLES, hasPermission } from "../config/roles.js";

// Check if user is admin (backward compatibility)
export const isAdmin = catchAsync(async (req, res, next) => {
    // Check if client prefers Arabic
    const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

    if (!req.user) {
        const message = isArabic 
            ? "مطلوب مصادقة" 
            : "Authentication required";
        return next(new AppError(401, message, 'UNAUTHORIZED', null, isArabic));
    }

    if (req.user.role !== ROLES.ADMIN) {
        const message = isArabic 
            ? "غير مصرح - مطلوب وصول المشرف" 
            : "Unauthorized - Admin access required";
        return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
    }

    next();
});

// Check if user is admin or manager
export const isAdminOrManager = catchAsync(async (req, res, next) => {
    // Check if client prefers Arabic
    const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

    if (!req.user) {
        const message = isArabic 
            ? "مطلوب مصادقة" 
            : "Authentication required";
        return next(new AppError(401, message, 'UNAUTHORIZED', null, isArabic));
    }

    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.MANAGER) {
        const message = isArabic 
            ? "غير مصرح - مطلوب وصول المشرف أو المدير" 
            : "Unauthorized - Admin or Manager access required";
        return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
    }

    next();
});

// Check if user has specific admin permission
export const requireAdminPermission = (permission) => {
    return (req, res, next) => {
        // Check if client prefers Arabic
        const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

        if (!req.user) {
            const message = isArabic 
                ? "مطلوب مصادقة" 
                : "Authentication required";
            return next(new AppError(401, message, 'UNAUTHORIZED', null, isArabic));
        }

        if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.MANAGER) {
            const message = isArabic 
                ? "مطلوب وصول المشرف أو المدير" 
                : "Admin or Manager access required";
            return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
        }

        // Check if user has the required permission
        if (!hasPermission(req.user.role, permission)) {
            const message = isArabic 
                ? `صلاحيات غير كافية. مطلوب: ${permission}` 
                : `Insufficient permissions. Required: ${permission}`;
            return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
        }

        next();
    };
};

// Check if user has admin-level permission
export const requireAdminLevelPermission = (permission) => {
    return (req, res, next) => {
        // Check if client prefers Arabic
        const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

        if (!req.user) {
            const message = isArabic 
                ? "مطلوب مصادقة" 
                : "Authentication required";
            return next(new AppError(401, message, 'UNAUTHORIZED', null, isArabic));
        }

        if (req.user.role !== ROLES.ADMIN) {
            const message = isArabic 
                ? "مطلوب وصول المشرف" 
                : "Admin access required";
            return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
        }

        // Check if admin has the required permission
        if (!hasPermission(req.user.role, permission)) {
            const message = isArabic 
                ? `صلاحيات مشرف غير كافية. مطلوب: ${permission}` 
                : `Insufficient admin permissions. Required: ${permission}`;
            return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
        }

        next();
    };
};