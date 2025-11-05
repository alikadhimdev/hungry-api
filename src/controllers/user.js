import { User } from "../models/userModel.js"
import bcrypt from "bcrypt"

export const login = async (req, res) => {
    try {
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


        return res.status(200).json(user)


    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: "user already exists",
                data: {}
            })
        }
        if (password.length < 8) {
            return res.status(400).json({
                status: 400,
                message: "password must be at least 8 characters",
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

        return res.status(200).json({
            status: 200,
            message: "user created successfully",
            data: user
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}