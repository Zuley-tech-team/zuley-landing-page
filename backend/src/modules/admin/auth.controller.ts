import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Admin } from "../../models/admin.model";
import { env } from "../../config/env.config";
import { AdminLogger } from "../../services/admin-logger.service";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 1. Find Admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            // Slow down brute force a bit
            await new Promise(resolve => setTimeout(resolve, 500));
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 2. Check Password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Generate Token
        const token = jwt.sign({ id: admin._id, role: admin.role }, env.JWT_SECRET, {
            expiresIn: "4h",
        });

        // 4. Set Cookie
        res.cookie("admin_token", token, {
            httpOnly: true,
            secure: env.NODE_ENV === "production", // Secure in prod
            sameSite: "strict",
            maxAge: 4 * 60 * 60 * 1000, // 4 hours
        });

        // 5. Update last login
        admin.last_login = new Date();
        await admin.save();

        // 6. Log Action
        await AdminLogger.logAction(
            admin._id,
            "LOGIN",
            "system",
            undefined,
            { email: admin.email },
            req
        );

        res.json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });

    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("admin_token");
    res.json({ success: true, message: "Logged out" });
};

export const getMe = async (req: Request, res: Response) => {
    if (!req.admin) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = req.admin;
    res.json({
        success: true,
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        },
    });
};
