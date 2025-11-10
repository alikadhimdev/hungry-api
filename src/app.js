import express from "express";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/user_route.js";
import categoryRoute from "./routes/categoryRoute.js"
import productRoute from "./routes/productRoute.js"
import favoriteRoute from "./routes/favoriteRoute.js"
import { errorHandler } from "./middlewares/errorHandler.js";
import { responseHandler } from "./utils/responseHandler.js";
import toppingRoute from "./routes/toppingRoute.js"
import sideOptionRoute from "./routes/sideOptionRoute.js"
import cartRoute from "./routes/cartRoute.js"
import orderRoute from "./routes/orderRoute.js"
import orderHistoryRoute from "./routes/orderHistoryRoute.js"
import {
  sanitizeInput,
  validateOrigin,
  setSecurityHeaders,
  validateContentType,
  validateRequestSize
} from "./middlewares/securityMiddleware.js";

// Load environment variables
dotenv.config();

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  process.env.ADMIN_URL || "http://localhost:3001"
];

// Security middlewares
app.use(helmet()); // Set security-related HTTP headers

// CORS configuration - more flexible in development
const corsOptions = {
  origin: function (origin, callback) {
    // In development or if NODE_ENV is not set to production, allow all origins
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      // Allow all origins in development for easier testing
      return callback(null, true);
    }

    // In production, check if origin is in allowed list
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Set custom security headers
app.use(setSecurityHeaders);

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);

// Stricter rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.MAX_AUTH_ATTEMPTS) || 10, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply stricter rate limiting to auth routes
app.use("/api/auth", authLimiter);

// Validate request origin for sensitive operations
app.use("/api/auth", validateOrigin(allowedOrigins));
app.use("/api/orders", validateOrigin(allowedOrigins));
app.use("/api/cart", validateOrigin(allowedOrigins));

// Validate content type for API routes
app.use("/api", validateContentType(["application/json", "multipart/form-data"]));

// Basic middlewares - body parser with size limit
// Note: express.json() will reject requests larger than limit with 413 status
app.use(express.json({
  limit: '5mb',
  // Handle JSON parsing errors
  verify: (req, res, buf, encoding) => {
    // Check size before parsing
    if (buf && buf.length > 5 * 1024 * 1024) {
      throw new Error('Request entity too large');
    }
  }
}));

// Validate request size (5MB max) - after body parsing to check actual body size
app.use(validateRequestSize(5 * 1024 * 1024));
app.use(sanitizeInput); // Sanitize user input to prevent XSS
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
app.use(responseHandler);

// routes
app.use("/api/auth", userRoutes)
app.use("/api/category", categoryRoute)
app.use("/api/product", productRoute)
app.use("/api/favorite", favoriteRoute)
app.use("/api/toppings", toppingRoute)
app.use("/api/options", sideOptionRoute)
app.use("/api/cart", cartRoute)
app.use("/api/orders", orderRoute)
app.use("/api/order-history", orderHistoryRoute)

// Error MiddleWare Handler
app.use(errorHandler);

export default app;