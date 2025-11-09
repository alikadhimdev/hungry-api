// Error types for better error handling
export const ERROR_TYPES = {
  // Client errors (4xx)
  BAD_REQUEST: {
    code: 400,
    type: 'BAD_REQUEST',
    arabicMessage: 'طلب غير صالح',
    logLevel: 'low',
    isClientError: true
  },
  UNAUTHORIZED: {
    code: 401,
    type: 'UNAUTHORIZED',
    arabicMessage: 'غير مصرح لك بالوصول',
    logLevel: 'medium',
    isClientError: true
  },
  FORBIDDEN: {
    code: 403,
    type: 'FORBIDDEN',
    arabicMessage: 'ممنوع الوصول',
    logLevel: 'medium',
    isClientError: true
  },
  NOT_FOUND: {
    code: 404,
    type: 'NOT_FOUND',
    arabicMessage: 'المورد غير موجود',
    logLevel: 'low',
    isClientError: true
  },
  CONFLICT: {
    code: 409,
    type: 'CONFLICT',
    arabicMessage: 'تضارب في البيانات',
    logLevel: 'medium',
    isClientError: true
  },
  VALIDATION_ERROR: {
    code: 422,
    type: 'VALIDATION_ERROR',
    arabicMessage: 'خطأ في التحقق من البيانات',
    logLevel: 'medium',
    isClientError: true
  },
  TOO_MANY_REQUESTS: {
    code: 429,
    type: 'TOO_MANY_REQUESTS',
    arabicMessage: 'طلبات كثيرة جداً، يرجى المحاولة لاحقاً',
    logLevel: 'medium',
    isClientError: true
  },

  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: {
    code: 500,
    type: 'INTERNAL_SERVER_ERROR',
    arabicMessage: 'حدث خطأ في الخادم',
    logLevel: 'high',
    isClientError: false
  },
  DATABASE_ERROR: {
    code: 500,
    type: 'DATABASE_ERROR',
    arabicMessage: 'حدث خطأ في قاعدة البيانات',
    logLevel: 'high',
    isClientError: false
  },
  EXTERNAL_SERVICE_ERROR: {
    code: 502,
    type: 'EXTERNAL_SERVICE_ERROR',
    arabicMessage: 'حدث خطأ في الخدمة الخارجية',
    logLevel: 'high',
    isClientError: false
  },
  SERVICE_UNAVAILABLE: {
    code: 503,
    type: 'SERVICE_UNAVAILABLE',
    arabicMessage: 'الخدمة غير متاحة حالياً',
    logLevel: 'high',
    isClientError: false
  }
};

// Get error type by HTTP status code
export const getErrorType = (statusCode) => {
  const errorType = Object.values(ERROR_TYPES).find(type => type.code === statusCode);
  return errorType || ERROR_TYPES.INTERNAL_SERVER_ERROR;
};
