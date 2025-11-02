import jwt from "jsonwebtoken";
import User from "../models/authModel.js";

function parseCookieHeader(header) {
  if (!header) return {};
  return header.split(";").reduce((acc, part) => {
    const [k, v] = part.split("=");
    if (!k) return acc;
    acc[k.trim()] = decodeURIComponent((v || "").trim());
    return acc;
  }, {});
}

function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  const cookies = req.cookies || parseCookieHeader(req.headers.cookie);
  if (cookies && cookies.token) return cookies.token;
  return null;
}

export async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "غير مصرح: الرجاء تسجيل الدخول" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "جلسة غير صالحة" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "انتهت صلاحية الجلسة، سجّل الدخول مجددًا" });
    }
    return res.status(401).json({ message: "رمز وصول غير صالح" });
  }
}
