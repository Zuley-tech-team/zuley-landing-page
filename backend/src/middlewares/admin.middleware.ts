import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config";
import { Admin } from "../models/admin.model";

// Extend Express Request interface to include admin
declare global {
    namespace Express {
        interface Request {
            admin?: any;
        }
    }
}

export const authenticateAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // 1. Get token from cookies or header
        let token = req.cookies?.admin_token;

        // Fallback to Bearer token
        if (!token && req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // 2. Verify token
        const decoded: any = jwt.verify(token, env.JWT_SECRET);

        // 3. Check if admin still exists
        const admin = await Admin.findById(decoded.id).select("-password");
        if (!admin) {
            return res.status(401).json({ message: "Not authorized, admin not found" });
        }

        // 4. Attach admin to request
        req.admin = admin;
        next();
    } catch (error) {
        console.error("Admin Auth Error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};
