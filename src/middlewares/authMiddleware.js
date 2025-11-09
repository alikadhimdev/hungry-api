import { AuthService } from "../services/auth_service.js";

export const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
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