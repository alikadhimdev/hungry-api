import { AuthService } from "../services/auth_service.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ROLES, hasPermission } from "../config/roles.js";
import { RateLimit } from "../models/rateLimitModel.js";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// Rate limiting for authentication attempts using MongoDB
const isRateLimited = async (ip) => {
    try {
        const now = new Date();
        const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

        // Find or create rate limit record for this IP
        let rateLimitRecord = await RateLimit.findOne({ ip });

        if (!rateLimitRecord) {
            // Create new record
            rateLimitRecord = await RateLimit.create({
                ip,
                attempts: [{ timestamp: now }],
                expiresAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
            });
            return false; // First attempt, not rate limited
        }

        // Filter out attempts outside the time window
        rateLimitRecord.attempts = rateLimitRecord.attempts.filter(
            attempt => attempt.timestamp >= windowStart
        );

        // Add current attempt
        rateLimitRecord.attempts.push({ timestamp: now });
        rateLimitRecord.expiresAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

        // Save updated record
        await rateLimitRecord.save();

        // Check if too many attempts
        return rateLimitRecord.attempts.length >= MAX_ATTEMPTS;
    } catch (error) {
        // If database operation fails, log error but don't block the request
        console.error('Rate limiting check failed:', error);
        return false; // Fail open - allow the request
    }
};

export const authenticateToken = catchAsync(async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Check if client prefers Arabic
    const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

    // Check rate limiting (async)
    const rateLimited = await isRateLimited(ip);
    if (rateLimited) {
        const message = isArabic 
            ? "محاولات مصادقة كثيرة جداً. يرجى المحاولة مرة أخرى لاحقاً." 
            : "Too many authentication attempts. Please try again later.";
        return next(new AppError(429, message, 'TOO_MANY_REQUESTS', null, isArabic));
    }

    const authHeader = req.header('Authorization');

    if (!authHeader) {
        const message = isArabic 
            ? "مطلوب رمز الوصول" 
            : "Access token is required";
        return next(new AppError(401, message, 'UNAUTHORIZED', null, isArabic));
    }

    if (!authHeader.startsWith('Bearer ')) {
        const message = isArabic 
            ? "تنسيق الرمز غير صالح. استخدم 'Bearer [token]'" 
            : "Invalid token format. Use 'Bearer [token]'";
        return next(new AppError(401, message, 'UNAUTHORIZED', null, isArabic));
    }

    const token = authHeader.substring(7);

    if (!token) {
        const message = isArabic 
            ? "مطلوب رمز الوصول" 
            : "Access token is required";
        return next(new AppError(401, message, 'UNAUTHORIZED', null, isArabic));
    }

    try {
        const decoded = AuthService.verifyAccessToken(token);

        // Add role to user object if not present
        if (!decoded.role) {
            decoded.role = decoded.isAdmin ? ROLES.ADMIN : ROLES.USER;
        }

        req.user = decoded;
        next();
    } catch (error) {
        // Record failed attempt (async, don't wait for it)
        isRateLimited(ip).catch(err => {
            console.error('Failed to record rate limit attempt:', err);
        });

        const message = isArabic 
            ? "رمز غير صالح أو منتهي الصلاحية" 
            : "Invalid or expired token";
        return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
    }
});

// Middleware to check if user has specific permissions
export const requirePermission = (permission) => {
    return (req, res, next) => {
        // Check if client prefers Arabic
        const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

        if (!req.user) {
            const message = isArabic 
                ? "مطلوب مصادقة" 
                : "Authentication required";
            return next(new AppError(401, message, 'UNAUTHORIZED', null, isArabic));
        }

        // Check if user has the required permission based on their role
        if (hasPermission(req.user.role, permission)) {
            return next();
        }

        const message = isArabic 
            ? "صلاحيات غير كافية" 
            : "Insufficient permissions";
        return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
    };
};

// Middleware to check if user has specific role
export const requireRole = (role) => {
    return (req, res, next) => {
        // Check if client prefers Arabic
        const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

        if (!req.user) {
            const message = isArabic 
                ? "مطلوب مصادقة" 
                : "Authentication required";
            return next(new AppError(401, message, 'UNAUTHORIZED', null, isArabic));
        }

        if (req.user.role === role) {
            return next();
        }

        const message = isArabic 
            ? `الوصول مرفوض. مطلوب دور: ${role}` 
            : `Access denied. Required role: ${role}`;
        return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
    };
};

// Middleware to check if user has one of the specified roles
export const requireAnyRole = (roles) => {
    return (req, res, next) => {
        // Check if client prefers Arabic
        const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

        if (!req.user) {
            const message = isArabic 
                ? "مطلوب مصادقة" 
                : "Authentication required";
            return next(new AppError(401, message, 'UNAUTHORIZED', null, isArabic));
        }

        if (roles.includes(req.user.role)) {
            return next();
        }

        const message = isArabic 
            ? `الوصول مرفوض. مطلوب أحد هذه الأدوار: ${roles.join(', ')}` 
            : `Access denied. Required one of these roles: ${roles.join(', ')}`;
        return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
    };
};

// Middleware to check if user can access a specific resource
export const requireOwnership = (resourceIdParam = 'id') => {
    return catchAsync(async (req, res, next) => {
        // Check if client prefers Arabic
        const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

        // Admin and Manager users can access any resource
        if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER) {
            return next();
        }

        const resourceId = req.params[resourceIdParam];

        if (!resourceId) {
            const message = isArabic 
                ? "مطلوب معرف المورد" 
                : "Resource ID is required";
            return next(new AppError(400, message, 'BAD_REQUEST', null, isArabic));
        }

        // This would need to be customized based on your specific models
        // For example, for orders:
        if (req.path.includes('/orders/')) {
            const Order = await import('../models/orderModel.js');
            const order = await Order.default.findById(resourceId);

            if (!order) {
                const message = isArabic 
                    ? "الطلب غير موجود" 
                    : "Order not found";
                return next(new AppError(404, message, 'NOT_FOUND', null, isArabic));
            }

            if (order.user.toString() !== req.user.id) {
                const message = isArabic 
                    ? "يمكنك الوصول إلى طلباتك فقط" 
                    : "You can only access your own orders";
                return next(new AppError(403, message, 'FORBIDDEN', null, isArabic));
            }
        }

        // Add similar checks for other resources as needed

        next();
    });
};