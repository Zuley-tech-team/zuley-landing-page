"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectHoneypot = exports.publicRateLimit = void 0;
const appError_1 = __importDefault(require("../utils/appError"));
const store = new Map();
const getClientIp = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
        return forwardedFor.split(',')[0].trim();
    }
    return req.ip || 'unknown';
};
const publicRateLimit = (config) => {
    return (req, _res, next) => {
        const ip = getClientIp(req);
        const key = `${req.path}:${ip}`;
        const now = Date.now();
        const current = store.get(key);
        if (!current || now > current.resetAt) {
            store.set(key, { count: 1, resetAt: now + config.windowMs });
            return next();
        }
        if (current.count >= config.maxRequests) {
            return next(new appError_1.default('Too many requests from this IP. Please try again shortly.', 429));
        }
        current.count += 1;
        store.set(key, current);
        return next();
    };
};
exports.publicRateLimit = publicRateLimit;
const rejectHoneypot = (fieldName = 'website') => {
    return (req, _res, next) => {
        var _a;
        const value = (_a = req.body) === null || _a === void 0 ? void 0 : _a[fieldName];
        if (typeof value === 'string' && value.trim().length > 0) {
            return next(new appError_1.default('Spam protection triggered.', 400));
        }
        return next();
    };
};
exports.rejectHoneypot = rejectHoneypot;
