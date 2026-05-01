"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    order_id: {
        type: String,
        required: true,
        index: true,
    },
    order_ref: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true,
    },
    product_sku: {
        type: String,
        required: true,
        index: true,
    },
    product_name: {
        type: String,
        required: true,
        trim: true,
    },
    product_image: {
        type: String,
    },
    customer_name: {
        type: String,
        required: true,
        trim: true,
    },
    customer_email: {
        type: String,
        required: true,
        index: true,
    },
    customer_city: {
        type: String,
        trim: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
    },
    images: {
        type: [
            {
                url: { type: String, required: true },
                public_id: { type: String, required: true },
            },
        ],
        default: [],
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        index: true,
    },
    decided_at: {
        type: Date,
    },
    decided_by: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Admin",
    },
}, {
    timestamps: true,
});
reviewSchema.index({ order_id: 1, product_sku: 1 }, { unique: true });
exports.Review = mongoose_1.default.model("Review", reviewSchema);
