import Joi from "joi";

export const loginValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required'
    })
})

export const registerValidation = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'string.min': 'Name must be at least 3 characters',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required'
    })
})

export const updateValidation = Joi.object({
    name: Joi.string().min(3).max(50).messages({
        'string.min': 'Name must be at least 3 characters',
        'string.max': 'Name cannot exceed 50 characters',

    }),
    email: Joi.string().email().messages({
        'string.email': 'Please provide a valid email',

    }),
    password: Joi.string().min(8).messages({
        'string.min': 'Password must be at least 8 characters',

    }),
    isAdmin: Joi.boolean().messages({
        'boolean.base': 'isAdmin must be a boolean value'
    })
}).options({ convert: false })

export const refreshTokenValidation = Joi.object({
    refreshToken: Joi.string().required().messages({
        'any.required': 'Refresh token is required'
    })
})