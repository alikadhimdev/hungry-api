import { User } from "../models/userModel.js"
import bcrypt from "bcrypt"
import { AuthService } from "../services/auth_service.js";
import { loginValidation, registerValidation, updateValidation } from "../validations/authValidation.js";


export const login = async (req, res) => {
    try {

        const { error } = loginValidation.validate(req.body)

        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message,
                data: {}
            })
        }
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required",
                data: {}
            })
        }
        const user = await User.findOne({ email });
        if (!user || user == null) {
            return res.status(401).json({
                message: "invalid email or password"
            })
        }

        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(401).json({
                message: "invalid email or password"
            })
        }

        const token = AuthService.generateToken(user)


        return res.status(200).json({
            status: 200,
            message: "login successful",
            data: user,
            accessToken: token.accessToken,
            refreshToken: token.refreshToken
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const { error } = registerValidation.validate(req.body)
        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message,
                data: {}
            })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: "user already exists",
                data: {}
            })
        }


        const hashedPassword = await bcrypt.hash(password, 8)
        const user = new User({
            name,
            email,
            password: hashedPassword
        })

        await user.save()

        const tokens = AuthService.generateToken(user)

        return res.status(201).json({
            status: 201,
            message: "user created successfully",
            data: user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

export const profile = async (req, res) => {
    try {
        const authenticatedUserPayload = req.user

        const user = await User.findById(authenticatedUserPayload.id).select("-password")

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User profile not found.",
                data: {},
            });
        }


        return res.status(200).json({
            status: 200,
            message: "User profile fetched successfully",
            data: user,
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {},
        })
    }
}


export const updateProfile = async (req, res) => {
    try {
        const oldUser = req.user
        if (!oldUser) {
            return res.status(401).json({
                status: 401,
                message: "Unauthorized: User not found",
                data: {}
            });
        }
        const { name, email, password, isAdmin } = req.body

        const { error } = updateValidation.validate(req.body)

        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details.map(err => err.message).join(', ')
                , data: {}
            })
        }

        const updateData = {
            name, email, isAdmin
        }
        if (password) {
            updateData.password = await bcrypt.hash(password, 8)
        }


        const updateUser = await User.updateOne({ _id: oldUser.id }, {
            $set: updateData
        })


        if (updateUser.modifiedCount === 0) {
            return res.status(400).json({
                status: 400,
                message: "No changes were made to the user profile",
                data: {}
            });
        }
        return res.status(200).json({
            status: 200,
            message: "User profile updated successfully",
            data: { updateUser },
        })

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {},
        })
    }
}
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) {
            return res.status(400).json({
                status: 400,
                message: "Refresh token is required", data: {}
            })
        }

        const decoded = AuthService.verifyRefreshToken(refreshToken)
        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: {}
            })
        }
        const newTokens = AuthService.generateToken(user)

        return res.status(200).json({
            status: 200,
            message: "new token generated successfully",
            data: {},
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken
        })
    } catch (error) {
        return res.status(401).json({
            status: 401,
            message: "Invalid refresh token",
            data: {},
        })
    }
}