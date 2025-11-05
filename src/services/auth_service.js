import jwt from "jsonwebtoken"
import { jwtConfig } from "../config/jwt.js"

export class AuthService {
    static generateToken(user) {
        const payload = {
            id: user._id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin
        }
        const accessToken = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })
        const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn })

        return { accessToken, refreshToken }
    }


    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, jwtConfig.secret)
        } catch (error) {
            throw new Error('Invalid or expired token')
        }
    }

    static verifyRefreshToken(token) {
        return jwt.verify(token, jwtConfig.refreshSecret)
    }


    static decodeToken(token) {
        return jwt.decode(token)
    }

}