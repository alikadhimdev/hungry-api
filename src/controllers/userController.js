import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { AuthService } from "../services/auth_service.js";
import { loginValidation, registerValidation, updateValidation } from "../validations/authValidation.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import { processImageCreation, processImageUpdate } from "../services/imageService.js";

/**
 * تسجيل الدخول للمستخدم
 */
export const login = catchAsync(async (req, res, next) => {
    const { error } = loginValidation.validate(req.body);

    if (error) return next(new AppError(400, error.details[0].message));

    const { email, password } = req.body;

    // Validate password is provided
    if (!password) {
        return next(new AppError(400, "كلمة المرور مطلوبة", "Password is required"));
    }

    // Select password field explicitly because it has select: false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user || user == null) {
        return next(new AppError(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة"));
    }

    // Validate user has a password (for existing users who might not have password set)
    if (!user.password) {
        return next(new AppError(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة"));
    }

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) return next(new AppError(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة"));

    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    const token = AuthService.generateToken(user);

    return res.msg(200, "تم تسجيل الدخول بنجاح", {
        user: userResponse,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken
    });
});

/**
 * إنشاء حساب مستخدم جديد
 */
export const register = catchAsync(async (req, res, next) => {
    const { name, email, password, phone } = req.body;
    const { error } = registerValidation.validate(req.body);

    if (error) return next(new AppError(400, error.details[0].message));

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError(409, "المستخدم موجود بالفعل"));

    const hashedPassword = await bcrypt.hash(password, 8);

    // معالجة الصورة باستخدام الخدمة الجديدة
    const imageResult = await processImageCreation(req);
    const imagePath = imageResult.imagePath || null;

    const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        image: imagePath
    });

    await user.save();

    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    const tokens = AuthService.generateToken(user);

    return res.msg(201, "تم إنشاء المستخدم بنجاح", {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
    });
});

/**
 * جلب بيانات الملف الشخصي للمستخدم
 */
export const profile = catchAsync(async (req, res, next) => {
    const userAccess = req.user;
    const user = await User.findById(userAccess.id).select("-password");

    if (!user) return next(new AppError(404, "المستخدم غير موجود"));

    return res.msg(200, "تم تحميل بيانات الملف الشخصي بنجاح", user);
});

/**
 * تسجيل الخروج
 */
export const logout = catchAsync(async (req, res, next) => {
    req.user = null;
    return res.msg(200, "تم تسجيل الخروج بنجاح", {});
});

/**
 * تحديث بيانات الملف الشخصي للمستخدم
 */
export const updateProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const oldUser = await User.findById(userId);

    if (!oldUser) return next(new AppError(404, "المستخدم غير موجود"));

    const { name, email, phone, password, isAdmin, address, visa } = req.body;
    const { error } = updateValidation.validate(req.body);

    if (error) return next(new AppError(400, error.details[0].message));

    const updateData = {
        name,
        email,
        phone,
        address,
        visa
    };

    // Security: Prevent regular users from updating isAdmin field
    // Only admins can update isAdmin, and only for other users
    if (isAdmin !== undefined) {
        // Check if user is admin and trying to update another user
        if (req.user.role === 'admin' && req.user.id !== oldUser.id.toString()) {
            // Admin can update isAdmin for other users
            updateData.isAdmin = isAdmin;
        } else if (req.user.id === oldUser.id.toString()) {
            // User cannot update their own isAdmin status
            return next(new AppError(403, "لا يمكنك تحديث صلاحياتك الخاصة"));
        } else {
            // Non-admin trying to update isAdmin
            return next(new AppError(403, "غير مصرح لك بتحديث صلاحيات المستخدم"));
        }
    }

    if (password) {
        updateData.password = await bcrypt.hash(password, 8);
    }

    // معالجة الصورة باستخدام الخدمة الجديدة
    const imageResult = await processImageUpdate(req, oldUser.image);
    updateData.image = imageResult.image;

    const updateUser = await User.updateOne({ _id: oldUser.id }, {
        $set: updateData
    });

    if (updateUser.modifiedCount === 0) return next(new AppError(400, "لم يتم إجراء أي تغييرات"));

    const newUser = await User.findById(oldUser.id).select("-password");

    return res.msg(200, "تم تحديث بيانات المستخدم بنجاح", newUser);
});

/**
 * تجديد رمز الوصول
 */
export const refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return next(new AppError(400, "رمز التحديث مطلوب"));

    const decoded = AuthService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) return next(new AppError(401, "رمز التحديث غير صالح"));

    const newTokens = AuthService.generateToken(user);

    return res.msg(200, "تم إنشاء رمز التحديث بنجاح", {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
    });
});