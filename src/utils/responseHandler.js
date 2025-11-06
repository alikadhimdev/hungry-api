export const responseHandler = (req, res, next) => {
    res.msg = (statusCode, message, success, data = {}) => {
        res.status(statusCode).json({
            status: statusCode,
            success,
            message,
            data
        })
    }

    next()
}