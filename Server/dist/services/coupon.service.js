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
exports.findCouponByCode = exports.validateCoupon = exports.calculateCouponDiscount = exports.calculateEligibleSubtotal = exports.isCouponActive = void 0;
const coupon_model_1 = require("../models/coupon.model");
const normalizeCode = (code) => code.trim().toUpperCase();
const isCouponActive = (coupon, now = new Date()) => {
    if (!coupon.is_active)
        return false;
    if (coupon.starts_at && now < coupon.starts_at)
        return false;
    if (coupon.ends_at && now > coupon.ends_at)
        return false;
    if (coupon.usage_limit && coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit)
        return false;
    return true;
};
exports.isCouponActive = isCouponActive;
const calculateEligibleSubtotal = (coupon, items) => {
    if (coupon.applies_to_all) {
        return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    }
    const eligibleSkus = new Set((coupon.applicable_skus || []).map((sku) => sku.trim()));
    return items.reduce((sum, item) => {
        if (eligibleSkus.has(item.sku)) {
            return sum + item.unitPrice * item.quantity;
        }
        return sum;
    }, 0);
};
exports.calculateEligibleSubtotal = calculateEligibleSubtotal;
const calculateCouponDiscount = (coupon, eligibleSubtotal) => {
    if (eligibleSubtotal <= 0)
        return 0;
    let discount = 0;
    if (coupon.discount_type === "percentage") {
        discount = Math.round((eligibleSubtotal * coupon.discount_value) / 100);
    }
    else {
        discount = Math.round(coupon.discount_value);
    }
    if (coupon.max_discount && coupon.max_discount > 0) {
        discount = Math.min(discount, coupon.max_discount);
    }
    return Math.max(0, Math.min(discount, eligibleSubtotal));
};
exports.calculateCouponDiscount = calculateCouponDiscount;
const validateCoupon = (coupon, items, orderSubtotal) => {
    if (!(0, exports.isCouponActive)(coupon)) {
        return { isValid: false, reason: "Coupon is not active", discountAmount: 0, eligibleSubtotal: 0 };
    }
    if (coupon.min_order_value && orderSubtotal < coupon.min_order_value) {
        return { isValid: false, reason: "Order value is below minimum", discountAmount: 0, eligibleSubtotal: 0 };
    }
    const eligibleSubtotal = (0, exports.calculateEligibleSubtotal)(coupon, items);
    if (eligibleSubtotal <= 0) {
        return { isValid: false, reason: "Coupon is not applicable to this order", discountAmount: 0, eligibleSubtotal: 0 };
    }
    const discountAmount = (0, exports.calculateCouponDiscount)(coupon, eligibleSubtotal);
    if (discountAmount <= 0) {
        return { isValid: false, reason: "Coupon provides no discount", discountAmount: 0, eligibleSubtotal };
    }
    return { isValid: true, discountAmount, eligibleSubtotal, coupon };
};
exports.validateCoupon = validateCoupon;
const findCouponByCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const normalized = normalizeCode(code);
    if (!normalized)
        return null;
    return coupon_model_1.Coupon.findOne({ code: normalized });
});
exports.findCouponByCode = findCouponByCode;
