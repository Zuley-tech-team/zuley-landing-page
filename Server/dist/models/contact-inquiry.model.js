"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactInquiry = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contactInquirySchema = new mongoose_1.default.Schema({
    full_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    inquiry_type: {
        type: String,
        required: true,
        enum: [
            'general',
            'product',
            'order',
            'personalization',
            'corporate',
            'complaint',
            'other',
        ],
        default: 'general',
    },
    order_id: { type: String, trim: true },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    source_page: { type: String, trim: true, default: 'contact' },
    status: {
        type: String,
        enum: ['new', 'in_progress', 'resolved'],
        default: 'new',
        index: true,
    },
}, { timestamps: true });
exports.ContactInquiry = mongoose_1.default.model('ContactInquiry', contactInquirySchema);
