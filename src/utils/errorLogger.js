import fs from 'fs';
import path from 'path';
import { ERROR_TYPES } from './errorTypes.js';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Error log file paths
const errorLogFile = path.join(logsDir, 'errors.log');
const criticalErrorLogFile = path.join(logsDir, 'critical-errors.log');

// Write to log file
const writeLog = (filePath, logMessage) => {
  try {
    fs.appendFileSync(filePath, logMessage + '');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
};

// Format error message for logging
const formatLogMessage = (error, req, errorType) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  const method = req.method;
  const url = req.originalUrl;
  const userId = req.user ? req.user.id : 'Anonymous';

  return `${timestamp} [${errorType.logLevel.toUpperCase()}] ${errorType.type}: ${error.message} | IP: ${ip} | User: ${userId} | Method: ${method} | URL: ${url} | User-Agent: ${userAgent}`;
};

// Log error based on its type
export const logError = (error, req) => {
  const errorType = ERROR_TYPES[error.type] || getErrorTypeByCode(error.statusCode);
  const logMessage = formatLogMessage(error, req, errorType);

  // Log to console
  console.error(logMessage);

  // Log to file based on error level
  if (errorType.logLevel === 'high') {
    writeLog(criticalErrorLogFile, logMessage);
  } else {
    writeLog(errorLogFile, logMessage);
  }

  // For critical errors, we might want to send notifications
  if (errorType.logLevel === 'high' && process.env.NODE_ENV === 'production') {
    // Here you could add code to send notifications to admin, Slack, etc.
    // For example: sendCriticalErrorNotification(error, req);
  }
};

// Helper function to get error type by status code
const getErrorTypeByCode = (statusCode) => {
  const errorType = Object.values(ERROR_TYPES).find(type => type.code === statusCode);
  return errorType || ERROR_TYPES.INTERNAL_SERVER_ERROR;
};

// Clean up old log files (could be run by a cron job)
export const cleanupOldLogs = (daysToKeep = 30) => {
  try {
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToKeep));

    [errorLogFile, criticalErrorLogFile].forEach(logFile => {
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(logFile);
          console.log(`Deleted old log file: ${logFile}`);
        }
      }
    });
  } catch (err) {
    console.error('Failed to clean up old log files:', err);
  }
};
