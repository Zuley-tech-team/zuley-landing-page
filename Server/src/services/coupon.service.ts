import { Coupon, type ICoupon } from "../models/coupon.model";

export type CouponItemInput = {
  sku: string;
  quantity: number;
  unitPrice: number;
};

export type CouponValidationResult = {
  isValid: boolean;
  reason?: string;
  discountAmount: number;
  eligibleSubtotal: number;
  coupon?: ICoupon;
};

const normalizeCode = (code: string) => code.trim().toUpperCase();

export const isCouponActive = (coupon: ICoupon, now: Date = new Date()): boolean => {
  if (!coupon.is_active) return false;
  if (coupon.starts_at && now < coupon.starts_at) return false;
  if (coupon.ends_at && now > coupon.ends_at) return false;
  if (coupon.usage_limit && coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) return false;
  return true;
};

export const calculateEligibleSubtotal = (coupon: ICoupon, items: CouponItemInput[]): number => {
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

export const calculateCouponDiscount = (
  coupon: ICoupon,
  eligibleSubtotal: number
): number => {
  if (eligibleSubtotal <= 0) return 0;

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = Math.round((eligibleSubtotal * coupon.discount_value) / 100);
  } else {
    discount = Math.round(coupon.discount_value);
  }

  if (coupon.max_discount && coupon.max_discount > 0) {
    discount = Math.min(discount, coupon.max_discount);
  }

  return Math.max(0, Math.min(discount, eligibleSubtotal));
};

export const validateCoupon = (
  coupon: ICoupon,
  items: CouponItemInput[],
  orderSubtotal: number
): CouponValidationResult => {
  if (!isCouponActive(coupon)) {
    return { isValid: false, reason: "Coupon is not active", discountAmount: 0, eligibleSubtotal: 0 };
  }

  if (coupon.min_order_value && orderSubtotal < coupon.min_order_value) {
    return { isValid: false, reason: "Order value is below minimum", discountAmount: 0, eligibleSubtotal: 0 };
  }

  const eligibleSubtotal = calculateEligibleSubtotal(coupon, items);
  if (eligibleSubtotal <= 0) {
    return { isValid: false, reason: "Coupon is not applicable to this order", discountAmount: 0, eligibleSubtotal: 0 };
  }

  const discountAmount = calculateCouponDiscount(coupon, eligibleSubtotal);
  if (discountAmount <= 0) {
    return { isValid: false, reason: "Coupon provides no discount", discountAmount: 0, eligibleSubtotal };
  }

  return { isValid: true, discountAmount, eligibleSubtotal, coupon };
};

export const findCouponByCode = async (code: string): Promise<ICoupon | null> => {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  return Coupon.findOne({ code: normalized });
};
