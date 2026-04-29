"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const otpSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expires_at: {
        type: Date,
        required: true,
        // MongoDB TTL index: auto-delete expired docs
        index: { expires: 0 },
    },
    used: {
        type: Boolean,
        default: false,
    },
    attempts: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: { createdAt: "created_at", updatedAt: false },
});
exports.Otp = mongoose_1.default.model("Otp", otpSchema);
