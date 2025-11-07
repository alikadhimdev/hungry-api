export const responseHandler = (req, res, next) => {
    res.msg = (statusCode, message, data = {}, success = true) => {
        res.status(statusCode).json({
            status: statusCode,
            success: success ? "success" : "fail",
            message,
            data
        })
    }

    next()
}