"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."],
    },
    is_profile_complete: {
        type: Boolean,
        default: false,
    },
    last_login: {
        type: Date,
    },
    login_history: [
        {
            type: Date,
        },
    ],
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});
exports.User = mongoose_1.default.model("User", userSchema);
