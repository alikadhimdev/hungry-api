export const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            status: 403,
            message: "Unauthorized - Must be an Admin",
            data: {}
        })
    }
    next()
}