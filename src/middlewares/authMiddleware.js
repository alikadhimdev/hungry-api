import { AuthService } from "../services/auth_service.js";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: 401,
            message: "Authorization header (Bearer token) is missing or malformed",
            data: {}
        });
    }

    const token = authHeader && authHeader.split(' ')[2]
    console.log(token)

    try {
        const decoded = AuthService.verifyAccessToken(token)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(403).json({
            message: 'Invalid or expired token'
        })
    }
}