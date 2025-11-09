import xss from "xss";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

// Middleware to sanitize user input and prevent XSS attacks
export const sanitizeInput = catchAsync(async (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === "string") {
        req.body[key] = xss(req.body[key]);
      }
    });
  }

  // Sanitize URL parameters
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === "string") {
        req.params[key] = xss(req.params[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === "string") {
        req.query[key] = xss(req.query[key]);
      }
    });
  }

  next();
});

// Middleware to validate request origin
export const validateOrigin = (allowedOrigins) => {
  return (req, res, next) => {
    // Skip validation for GET, HEAD, and OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // In development or if NODE_ENV is not set to production, allow all requests
    // This makes testing easier with Postman, curl, etc.
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      return next();
    }

    // Only validate in production
    const origin = req.headers.origin || req.headers.referer;

    if (!origin) {
      return next(new AppError(403, "Origin not provided"));
    }

    const isAllowed = allowedOrigins.some(allowedOrigin => 
      origin.includes(allowedOrigin)
    );

    if (!isAllowed) {
      return next(new AppError(403, "Origin not allowed"));
    }

    next();
  };
};

// Middleware to set security headers
export const setSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Control referrer information
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
  );

  next();
};

// Middleware to validate content type
export const validateContentType = (allowedTypes) => {
  return (req, res, next) => {
    // Skip validation for GET, HEAD, OPTIONS, and DELETE requests (they don't need body)
    if (['GET', 'HEAD', 'OPTIONS', 'DELETE'].includes(req.method)) {
      return next();
    }

    // In development or if NODE_ENV is not set to production, be more lenient
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Skip validation if request has no body
    if (!req.headers["content-type"] && !req.headers["content-length"]) {
      return next();
    }

    // If content-type is provided, validate it
    if (req.headers["content-type"]) {
      const isAllowed = allowedTypes.some(type => 
        req.headers["content-type"].includes(type)
      );

      if (!isAllowed) {
        // In development, allow common content types for easier testing
        if (!isProduction && (
          req.headers["content-type"].includes('application/x-www-form-urlencoded') ||
          req.headers["content-type"].includes('text/plain')
        )) {
          return next();
        }
        return next(new AppError(400, `Content-Type not allowed. Allowed types: ${allowedTypes.join(', ')}`));
      }
    } else {
      // In development, allow requests without content-type for easier testing
      if (!isProduction) {
        return next();
      }
      return next(new AppError(400, "Content-Type header is required"));
    }

    next();
  };
};

// Middleware to validate request size
export const validateRequestSize = (maxSizeInBytes) => {
  return (req, res, next) => {
    const contentLength = req.headers["content-length"];

    if (contentLength && parseInt(contentLength, 10) > maxSizeInBytes) {
      return next(new AppError(413, "Request entity too large"));
    }

    next();
  };
};
