"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_model_1 = require("../../models/coupon.model");
const product_model_1 = require("../../models/product.model");
const coupon_service_1 = require("../../services/coupon.service");
const router = (0, express_1.Router)();
const parseSkuList = (value) => {
    if (!value)
        return [];
    if (Array.isArray(value)) {
        return value.map((sku) => String(sku).trim()).filter(Boolean);
    }
    return String(value)
        .split(",")
        .map((sku) => sku.trim())
        .filter(Boolean);
};
router.get("/available", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skus = parseSkuList(req.query.skus);
        const query = { is_active: true, is_visible: true };
        if (skus.length > 0) {
            query.$or = [{ applies_to_all: true }, { applicable_skus: { $in: skus } }];
        }
        const coupons = yield coupon_model_1.Coupon.find(query).sort({ createdAt: -1 });
        const available = coupons.filter((coupon) => (0, coupon_service_1.isCouponActive)(coupon));
        res.json({
            success: true,
            data: available.map((coupon) => ({
                id: coupon._id,
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                min_order_value: coupon.min_order_value,
                max_discount: coupon.max_discount,
                applies_to_all: coupon.applies_to_all,
                applicable_skus: coupon.applicable_skus,
                usage_limit: coupon.usage_limit,
                usage_count: coupon.usage_count,
                starts_at: coupon.starts_at,
                ends_at: coupon.ends_at,
            })),
        });
    }
    catch (error) {
        console.error("Get Coupons Error:", error);
        res.status(500).json({ message: "Failed to load coupons" });
    }
}));
router.post("/validate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, items } = req.body || {};
        if (!code || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Coupon code and items are required" });
        }
        const coupon = yield (0, coupon_service_1.findCouponByCode)(code);
        if (!coupon) {
            return res.status(404).json({ message: "Invalid coupon code" });
        }
        const skus = items.map((item) => String(item.sku || "").trim()).filter(Boolean);
        const products = yield product_model_1.Product.find({ sku: { $in: skus }, isActive: true });
        const productMap = new Map(products.map((product) => [product.sku, product]));
        const itemInputs = items.map((item) => {
            const sku = String(item.sku || "").trim();
            const quantity = Number(item.quantity || 0);
            const product = productMap.get(sku);
            if (!product) {
                throw new Error(`Product ${sku} is not available`);
            }
            return {
                sku,
                quantity,
                unitPrice: Math.round(product.price * 100),
            };
        });
        const subtotal = itemInputs.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const result = (0, coupon_service_1.validateCoupon)(coupon, itemInputs, subtotal);
        if (!result.isValid) {
            return res.status(400).json({ message: result.reason || "Coupon cannot be applied" });
        }
        res.json({
            success: true,
            data: {
                code: coupon.code,
                name: coupon.name,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                discount_amount: result.discountAmount,
                subtotal,
                total: Math.max(subtotal - result.discountAmount, 0),
            },
        });
    }
    catch (error) {
        console.error("Validate Coupon Error:", error);
        res.status(500).json({ message: error.message || "Failed to validate coupon" });
    }
}));
exports.default = router;
