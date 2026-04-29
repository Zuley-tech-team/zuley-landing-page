import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config";
import { User } from "../models/user.model";

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // 1. Get token from cookies or header
        let token = req.cookies?.user_token;

        // Fallback to Bearer token
        if (!token && req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // 2. Verify token
        const decoded: any = jwt.verify(token, env.JWT_SECRET);

        // 3. Check if user still exists
        const user = await User.findById(decoded.id).select("-__v");
        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        // 4. Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error("User Auth Error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};
