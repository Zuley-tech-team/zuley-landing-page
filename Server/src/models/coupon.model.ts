import mongoose, { Schema } from "mongoose";

export type CouponDiscountType = "percentage" | "flat";

export interface ICoupon extends mongoose.Document {
  code: string;
  name: string;
  description?: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_order_value?: number;
  max_discount?: number;
  applies_to_all: boolean;
  applicable_skus: string[];
  is_active: boolean;
  is_visible: boolean;
  usage_limit?: number;
  usage_count: number;
  starts_at?: Date;
  ends_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
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
  },
  { timestamps: true }
);

CouponSchema.index({ code: 1 });
CouponSchema.index({ is_active: 1, is_visible: 1 });

export const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);
