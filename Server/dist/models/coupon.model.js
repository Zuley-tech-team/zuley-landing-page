"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coupon = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CouponSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discount_type: { type: String, enum: ["percentage", "flat"], required: true },
    discount_value: { type: Number, required: true, min: 1 },
    min_order_value: { type: Number, default: 0 },
    max_discount: { type: Number },
    applies_to_all: { type: Boolean, default: false },
    applicable_skus: { type: [String], default: [] },
    is_active: { type: Boolean, default: true },
    is_visible: { type: Boolean, default: false },
    usage_limit: { type: Number, default: 0 },
    usage_count: { type: Number, default: 0 },
    starts_at: { type: Date },
    ends_at: { type: Date },
}, { timestamps: true });
CouponSchema.index({ code: 1 });
CouponSchema.index({ is_active: 1, is_visible: 1 });
exports.Coupon = mongoose_1.default.model("Coupon", CouponSchema);
