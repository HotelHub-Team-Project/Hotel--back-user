import jwt from "jsonwebtoken";
import { errorResponse } from "./response.js";
import { User } from "../user/model.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json(errorResponse("NO_TOKEN_PROVIDED", 401));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json(errorResponse("INVALID_TOKEN_FORMAT", 401));
    }

    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, secret);

    // 필요한 최소 사용자 정보 로드
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json(errorResponse("USER_NOT_FOUND", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res
      .status(401)
      .json(errorResponse("INVALID_OR_EXPIRED_TOKEN", 401));
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json(errorResponse("FORBIDDEN", 403));
    }
    next();
  };
};
