"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Testimonial = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const testimonialSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, trim: true, maxlength: 160 },
    city: { type: String, trim: true, maxlength: 120 },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    quote: { type: String, required: true, trim: true, maxlength: 1000 },
    is_featured: { type: Boolean, default: false, index: true },
    is_active: { type: Boolean, default: true, index: true },
    source: { type: String, trim: true, default: 'manual' },
    display_order: { type: Number, default: 0, index: true },
}, { timestamps: true });
exports.Testimonial = mongoose_1.default.model('Testimonial', testimonialSchema);
