import Joi from "joi";

export const sideOptionValidation = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'string.min': 'يجب أن يكون الاسم 3 أحرف على الأقل',
        'string.max': 'لا يمكن أن يتجاوز الاسم 50 حرفًا',
        'any.required': 'الاسم مطلوب'
    }),

    image: Joi.any().optional()
})
