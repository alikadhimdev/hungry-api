export const responseHandler = (req, res, next) => {
    // Check if client prefers Arabic
    const isArabic = req && req.headers && (req.headers['accept-language'] && (req.headers['accept-language'].includes('ar') || req.headers['accept-language'].includes('ar-SA')));

    res.msg = (statusCode, message, data = {}, success = true, arabicMessage = null) => {
        // Use Arabic message if available and client prefers Arabic
        const finalMessage = isArabic && arabicMessage ? arabicMessage : message;

        res.status(statusCode).json({
            status: statusCode,
            success: success ? "success" : "fail",
            message: finalMessage,
            data
        });
    };

    // Add a method specifically for Arabic responses
    res.arMsg = (statusCode, message, arabicMessage, data = {}, success = true) => {
        // Use Arabic message if client prefers Arabic, otherwise use English
        const finalMessage = isArabic ? arabicMessage : message;

        res.status(statusCode).json({
            status: statusCode,
            success: success ? "success" : "fail",
            message: finalMessage,
            data
        });
    };

    // Add a method for success responses with localized messages
    res.success = (data = {}, message = "Operation successful", arabicMessage = "تمت العملية بنجاح") => {
        const finalMessage = isArabic ? arabicMessage : message;

        res.status(200).json({
            status: 200,
            success: "success",
            message: finalMessage,
            data
        });
    };

    // Add a method for creation responses with localized messages
    res.created = (data = {}, message = "Resource created successfully", arabicMessage = "تم إنشاء المورد بنجاح") => {
        const finalMessage = isArabic ? arabicMessage : message;

        res.status(201).json({
            status: 201,
            success: "success",
            message: finalMessage,
            data
        });
    };

    // Add a method for bad request responses with localized messages
    res.badRequest = (message = "Bad request", arabicMessage = "طلب غير صالح", data = {}) => {
        const finalMessage = isArabic ? arabicMessage : message;

        res.status(400).json({
            status: 400,
            success: "fail",
            message: finalMessage,
            data
        });
    };

    // Add a method for unauthorized responses with localized messages
    res.unauthorized = (message = "Unauthorized", arabicMessage = "غير مصرح", data = {}) => {
        const finalMessage = isArabic ? arabicMessage : message;

        res.status(401).json({
            status: 401,
            success: "fail",
            message: finalMessage,
            data
        });
    };

    // Add a method for forbidden responses with localized messages
    res.forbidden = (message = "Forbidden", arabicMessage = "ممنوع الوصول", data = {}) => {
        const finalMessage = isArabic ? arabicMessage : message;

        res.status(403).json({
            status: 403,
            success: "fail",
            message: finalMessage,
            data
        });
    };

    // Add a method for not found responses with localized messages
    res.notFound = (message = "Resource not found", arabicMessage = "المورد غير موجود", data = {}) => {
        const finalMessage = isArabic ? arabicMessage : message;

        res.status(404).json({
            status: 404,
            success: "fail",
            message: finalMessage,
            data
        });
    };

    // Add a method for conflict responses with localized messages
    res.conflict = (message = "Conflict", arabicMessage = "تضارب", data = {}) => {
        const finalMessage = isArabic ? arabicMessage : message;

        res.status(409).json({
            status: 409,
            success: "fail",
            message: finalMessage,
            data
        });
    };

    // Add a method for server error responses with localized messages
    res.serverError = (message = "Internal server error", arabicMessage = "خطأ في الخادم", data = {}) => {
        const finalMessage = isArabic ? arabicMessage : message;

        res.status(500).json({
            status: 500,
            success: "fail",
            message: finalMessage,
            data
        });
    };

    next();
}