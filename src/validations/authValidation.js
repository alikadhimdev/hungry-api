import Joi from "joi";

// تعريف نمط كلمة المرور القوية
const passwordPattern = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])');

// تعريف نمط رقم الهاتف الصحيح
const phonePattern = new RegExp('^[+]?[(]?[0-9]{1,4}[)]?[-s./0-9]*$');

export const loginValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'الرجاء تزويد بريد إلكتروني صحيح',
        'any.required': 'البريد الإلكتروني مطلوب'
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
        'any.required': 'كلمة المرور مطلوبة'
    })
});

export const registerValidation = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'string.min': 'يجب أن يكون الاسم 3 أحرف على الأقل',
        'string.max': 'لا يمكن أن يتجاوز الاسم 50 حرفًا',
        'any.required': 'الاسم مطلوب'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'الرجاء تزويد بريد إلكتروني صحيح',
        'any.required': 'البريد الإلكتروني مطلوب'
    }),
    password: Joi.string()
        .min(8)
        .pattern(passwordPattern)
        .required()
        .messages({
            'string.pattern.base': 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل، وحرف كبير واحد، ورقم واحد',
            'string.min': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
            'any.required': 'كلمة المرور مطلوبة'
        }),
    phone: Joi.string()
        .pattern(phonePattern)
        .min(11)
        .max(16)
        .required()
        .messages({
            'string.pattern.base': 'الرجاء تزويد رقم هاتف صحيح',
            'string.min': 'يجب أن يكون رقم الهاتف 11 رقمًا على الأقل',
            'string.max': 'لا يمكن أن يتجاوز رقم الهاتف 16 رقمًا',
            'any.required': 'رقم الهاتف مطلوب'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'كلمات المرور غير متطابقة',
            'any.required': 'تأكيد كلمة المرور مطلوب'
        })
});

// تحقق للمستخدمين العاديين (بدون صلاحيات تعديل isAdmin)
export const updateValidation = Joi.object({
    name: Joi.string().min(3).max(50).messages({
        'string.min': 'يجب أن يكون الاسم 3 أحرف على الأقل',
        'string.max': 'لا يمكن أن يتجاوز الاسم 50 حرفًا'
    }),
    email: Joi.string().email().messages({
        'string.email': 'الرجاء تزويد بريد إلكتروني صحيح'
    }),
    password: Joi.string()
        .min(8)
        .pattern(passwordPattern)
        .messages({
            'string.pattern.base': 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل، وحرف كبير واحد، ورقم واحد، وحرف خاص واحد',
            'string.min': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'
        }),
    phone: Joi.string()
        .pattern(phonePattern)
        .min(11)
        .max(16)
        .messages({
            'string.pattern.base': 'الرجاء تزويد رقم هاتف صحيح',
            'string.min': 'يجب أن يكون رقم الهاتف 11 رقمًا على الأقل',
            'string.max': 'لا يمكن أن يتجاوز رقم الهاتف 16 رقمًا'
        })
}).options({ convert: false });

// تحقق خاص للمسؤولين (يمكنهم تعديل حقل isAdmin)
export const adminUpdateValidation = Joi.object({
    name: Joi.string().min(3).max(50).messages({
        'string.min': 'يجب أن يكون الاسم 3 أحرف على الأقل',
        'string.max': 'لا يمكن أن يتجاوز الاسم 50 حرفًا'
    }),
    email: Joi.string().email().messages({
        'string.email': 'الرجاء تزويد بريد إلكتروني صحيح'
    }),
    password: Joi.string()
        .min(8)
        .pattern(passwordPattern)
        .messages({
            'string.pattern.base': 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل، وحرف كبير واحد، ورقم واحد، وحرف خاص واحد',
            'string.min': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'
        }),
    phone: Joi.string()
        .pattern(phonePattern)
        .min(11)
        .max(16)
        .messages({
            'string.pattern.base': 'الرجاء تزويد رقم هاتف صحيح',
            'string.min': 'يجب أن يكون رقم الهاتف 11 رقمًا على الأقل',
            'string.max': 'لا يمكن أن يتجاوز رقم الهاتف 16 رقمًا'
        }),
    isAdmin: Joi.boolean().messages({
        'boolean.base': 'يجب أن يكون isAdmin قيمة منطقية (true/false)'
    })
}).options({ convert: false });

export const refreshTokenValidation = Joi.object({
    refreshToken: Joi.string().required().messages({
        'any.required': 'رمز التحديث مطلوب'
    })
});

// التحقق من تغيير كلمة المرور
export const changePasswordValidation = Joi.object({
    currentPassword: Joi.string().required().messages({
        'any.required': 'كلمة المرور الحالية مطلوبة'
    }),
    newPassword: Joi.string()
        .min(8)
        .pattern(passwordPattern)
        .required()
        .messages({
            'string.pattern.base': 'يجب أن تحتوي كلمة المرور الجديدة على حرف صغير واحد على الأقل، وحرف كبير واحد، ورقم واحد، وحرف خاص واحد',
            'string.min': 'يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل',
            'any.required': 'كلمة المرور الجديدة مطلوبة'
        }),
    confirmNewPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'كلمات المرور الجديدة غير متطابقة',
            'any.required': 'تأكيد كلمة المرور الجديدة مطلوب'
        })
});