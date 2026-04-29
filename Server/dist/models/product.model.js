"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ["silver-pens", "silver-phone-covers"],
        index: true,
    },
    categoryLabel: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    originalPrice: {
        type: Number,
        min: 0,
    },
    image: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
    description: {
        type: String,
        required: true,
    },
    longDescription: {
        type: String,
    },
    badge: {
        type: String,
        enum: ["Bestseller", "New", "Limited Edition", null],
    },
    features: {
        type: [String],
        default: [],
    },
    specifications: {
        type: Map,
        of: String,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
});
// Virtual for checking discount
productSchema.virtual("hasDiscount").get(function () {
    return this.originalPrice && this.originalPrice > this.price;
});
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });
exports.Product = mongoose_1.default.model("Product", productSchema);
