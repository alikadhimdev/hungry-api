export const responseHandler = (req, res, next) => {
    res.success = (statusCode, message, data = {}) => {
        res.status(statusCode).json({
            status: statusCode,
            message,
            data
        })
    }
    next()
}