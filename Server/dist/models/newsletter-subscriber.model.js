"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterSubscriber = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const newsletterSubscriberSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['subscribed', 'unsubscribed'],
        default: 'subscribed',
        index: true,
    },
    subscribed_at: { type: Date, default: Date.now },
    unsubscribed_at: { type: Date },
    source: { type: String, trim: true, default: 'footer' },
}, { timestamps: true });
exports.NewsletterSubscriber = mongoose_1.default.model('NewsletterSubscriber', newsletterSubscriberSchema);
