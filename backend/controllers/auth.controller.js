import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/authModel.js";

function generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

function cookieOptions() {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
    };
}

export async function signUp(req, res) {
    const { name, email, password } = req.body || {};
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "الاسم والبريد وكلمة المرور مطلوبة" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "البريد مستخدم مسبقاً" });
        }

        const user = new User({ name, email, password });
        await user.save();

        const token = generateToken(user._id);
        res.cookie("token", token, cookieOptions());
        return res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        return res.status(500).json({ message: "حدث خطأ غير متوقع" });
    }
}

export async function signIn(req, res) {
    const { email, password } = req.body || {};
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "البريد وكلمة المرور مطلوبة" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
        }

        const token = generateToken(user._id);
        res.cookie("token", token, cookieOptions());
        return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        return res.status(500).json({ message: "حدث خطأ غير متوقع" });
    }
}

export async function signOut(req, res) {
    try {
        const opts = cookieOptions();
        res.clearCookie("token", { httpOnly: true, secure: opts.secure, sameSite: opts.sameSite });
        return res.json({ message: "تم تسجيل الخروج بنجاح" });
    } catch (error) {
        return res.status(500).json({ message: "حدث خطأ غير متوقع" });
    }
}
