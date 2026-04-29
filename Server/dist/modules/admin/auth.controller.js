"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin_model_1 = require("../../models/admin.model");
const env_config_1 = require("../../config/env.config");
const admin_logger_service_1 = require("../../services/admin-logger.service");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        // 1. Find Admin
        const admin = yield admin_model_1.Admin.findOne({ email });
        if (!admin) {
            // Slow down brute force a bit
            yield new Promise(resolve => setTimeout(resolve, 500));
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // 2. Check Password
        const isMatch = yield admin.comparePassword(password);
        if (!isMatch) {
            yield new Promise(resolve => setTimeout(resolve, 500));
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // 3. Generate Token
        const token = jsonwebtoken_1.default.sign({ id: admin._id, role: admin.role }, env_config_1.env.JWT_SECRET, {
            expiresIn: "4h",
        });
        // 4. Set Cookie
        res.cookie("admin_token", token, {
            httpOnly: true,
            secure: env_config_1.env.NODE_ENV === "production", // Secure in prod
            sameSite: "strict",
            maxAge: 4 * 60 * 60 * 1000, // 4 hours
        });
        // 5. Update last login
        admin.last_login = new Date();
        yield admin.save();
        // 6. Log Action
        yield admin_logger_service_1.AdminLogger.logAction(admin._id, "LOGIN", "system", undefined, { email: admin.email }, req);
        res.json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    }
    catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("admin_token");
    res.json({ success: true, message: "Logged out" });
});
exports.logout = logout;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.getMe = getMe;
