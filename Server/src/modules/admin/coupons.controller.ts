import { Request, Response } from "express";
import { Coupon } from "../../models/coupon.model";
import { AdminLogger } from "../../services/admin-logger.service";

const normalizeSkuList = (skus: unknown): string[] => {
  if (!skus) return [];
  if (Array.isArray(skus)) {
    return skus.map((sku) => String(sku).trim()).filter(Boolean);
  }
  return String(skus)
    .split(",")
    .map((sku) => sku.trim())
    .filter(Boolean);
};

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    const query: any = {};
    if (status === "active") query.is_active = true;
    if (status === "inactive") query.is_active = false;

    if (search) {
      const regex = new RegExp(search as string, "i");
      query.$or = [{ code: regex }, { name: regex }];
    }

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Coupon.countDocuments(query);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: total,
      },
    });
  } catch (error) {
    console.error("Get Coupons Error:", error);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};

    if (!payload.code || !payload.name) {
      return res.status(400).json({ message: "Coupon code and name are required" });
    }

    if (!payload.discount_type || !payload.discount_value) {
      return res.status(400).json({ message: "Discount type and value are required" });
    }

    const coupon = await Coupon.create({
      code: String(payload.code).trim().toUpperCase(),
      name: String(payload.name).trim(),
      description: payload.description ? String(payload.description).trim() : undefined,
      discount_type: payload.discount_type,
      discount_value: Number(payload.discount_value),
      min_order_value: payload.min_order_value ? Number(payload.min_order_value) : 0,
      max_discount: payload.max_discount ? Number(payload.max_discount) : undefined,
      applies_to_all: Boolean(payload.applies_to_all),
      applicable_skus: payload.applies_to_all ? [] : normalizeSkuList(payload.applicable_skus),
      is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
      is_visible: payload.is_visible !== undefined ? Boolean(payload.is_visible) : false,
      usage_limit: payload.usage_limit ? Number(payload.usage_limit) : 0,
      starts_at: payload.starts_at ? new Date(payload.starts_at) : undefined,
      ends_at: payload.ends_at ? new Date(payload.ends_at) : undefined,
    });

    await AdminLogger.logAction(
      (req as any).admin?._id,
      "CREATE_COUPON",
      "coupon",
      String(coupon._id),
      { code: coupon.code },
      req
    );

    res.status(201).json({ success: true, data: coupon });
  } catch (error: any) {
    console.error("Create Coupon Error:", error);
    res.status(500).json({ message: error.message || "Failed to create coupon" });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (payload.code) coupon.code = String(payload.code).trim().toUpperCase();
    if (payload.name) coupon.name = String(payload.name).trim();
    if (payload.description !== undefined) coupon.description = payload.description ? String(payload.description).trim() : undefined;
    if (payload.discount_type) coupon.discount_type = payload.discount_type;
    if (payload.discount_value !== undefined) coupon.discount_value = Number(payload.discount_value);
    if (payload.min_order_value !== undefined) coupon.min_order_value = Number(payload.min_order_value);
    if (payload.max_discount !== undefined) coupon.max_discount = payload.max_discount ? Number(payload.max_discount) : undefined;
    if (payload.applies_to_all !== undefined) {
      coupon.applies_to_all = Boolean(payload.applies_to_all);
      if (coupon.applies_to_all) {
        coupon.applicable_skus = [];
      }
    }
    if (payload.applicable_skus !== undefined) {
      coupon.applicable_skus = coupon.applies_to_all ? [] : normalizeSkuList(payload.applicable_skus);
    }
    if (payload.is_active !== undefined) coupon.is_active = Boolean(payload.is_active);
    if (payload.is_visible !== undefined) coupon.is_visible = Boolean(payload.is_visible);
    if (payload.usage_limit !== undefined) coupon.usage_limit = Number(payload.usage_limit);
    if (payload.starts_at !== undefined) coupon.starts_at = payload.starts_at ? new Date(payload.starts_at) : undefined;
    if (payload.ends_at !== undefined) coupon.ends_at = payload.ends_at ? new Date(payload.ends_at) : undefined;

    await coupon.save();

    await AdminLogger.logAction(
      (req as any).admin?._id,
      "UPDATE_COUPON",
      "coupon",
      String(coupon._id),
      { code: coupon.code },
      req
    );

    res.json({ success: true, data: coupon });
  } catch (error: any) {
    console.error("Update Coupon Error:", error);
    res.status(500).json({ message: error.message || "Failed to update coupon" });
  }
};
