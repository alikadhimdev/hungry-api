import app from "./app.js";
import dotenv from "dotenv"
import { connectDB } from "./config/db.js";
import { handleUnhandledRejection, handleUncaughtException } from "./middlewares/errorHandler.js";
import { cleanupOldLogs } from "./utils/errorLogger.js";
import { validateEnv } from "./config/envValidation.js";

dotenv.config();

// Validate environment variables before starting the server
try {
    validateEnv();
} catch (error) {
    console.error('Environment validation failed:', error.message);
    process.exit(1);
}

// Handle uncaught exceptions
handleUncaughtException(process);

// Handle unhandled promise rejections
handleUnhandledRejection(process);

// Connect to database
connectDB();

// Clean up old log files (run once per day)
setInterval(() => {
  cleanupOldLogs(30); // Keep logs for 30 days
}, 24 * 60 * 60 * 1000); // Run once per day

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});
