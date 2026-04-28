"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorporateLead = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const corporateLeadSchema = new mongoose_1.default.Schema({
    company_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    contact_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    product_type: {
        type: String,
        required: true,
        enum: ['silver-pens', 'silver-phone-covers', 'mixed'],
        default: 'mixed',
    },
    expected_timeline: { type: String, trim: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 2000 },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'closed'],
        default: 'new',
        index: true,
    },
    source_page: { type: String, trim: true, default: 'corporate' },
}, { timestamps: true });
exports.CorporateLead = mongoose_1.default.model('CorporateLead', corporateLeadSchema);
