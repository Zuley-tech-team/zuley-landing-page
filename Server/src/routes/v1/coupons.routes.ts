import { Router } from "express";
import { Coupon } from "../../models/coupon.model";
import { Product } from "../../models/product.model";
import { findCouponByCode, validateCoupon, isCouponActive } from "../../services/coupon.service";

const router = Router();

const parseSkuList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((sku) => String(sku).trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((sku) => sku.trim())
    .filter(Boolean);
};

router.get("/available", async (req, res) => {
  try {
    const skus = parseSkuList(req.query.skus);

    const query: any = { is_active: true, is_visible: true };
    if (skus.length > 0) {
      query.$or = [{ applies_to_all: true }, { applicable_skus: { $in: skus } }];
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    const available = coupons.filter((coupon) => isCouponActive(coupon));

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
  } catch (error) {
    console.error("Get Coupons Error:", error);
    res.status(500).json({ message: "Failed to load coupons" });
  }
});

router.post("/validate", async (req, res) => {
  try {
    const { code, items } = req.body || {};

    if (!code || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Coupon code and items are required" });
    }

    const coupon = await findCouponByCode(code);
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    const skus = items.map((item: any) => String(item.sku || "").trim()).filter(Boolean);
    const products = await Product.find({ sku: { $in: skus }, isActive: true });

    const productMap = new Map(products.map((product) => [product.sku, product]));

    const itemInputs = items.map((item: any) => {
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
    const result = validateCoupon(coupon, itemInputs, subtotal);

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
  } catch (error: any) {
    console.error("Validate Coupon Error:", error);
    res.status(500).json({ message: error.message || "Failed to validate coupon" });
  }
});

export default router;
