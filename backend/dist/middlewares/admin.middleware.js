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
exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../config/env.config");
const admin_model_1 = require("../models/admin.model");
const authenticateAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // 1. Get token from cookies or header
        let token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.admin_token;
        // Fallback to Bearer token
        if (!token && ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.startsWith("Bearer"))) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }
        // 2. Verify token
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_SECRET);
        // 3. Check if admin still exists
        const admin = yield admin_model_1.Admin.findById(decoded.id).select("-password");
        if (!admin) {
            return res.status(401).json({ message: "Not authorized, admin not found" });
        }
        // 4. Attach admin to request
        req.admin = admin;
        next();
    }
    catch (error) {
        console.error("Admin Auth Error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
});
exports.authenticateAdmin = authenticateAdmin;
