import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      description: "Human-readable ID: ZUL-YYMMDD-XXXX",
    },
    customer_details: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      // Link to Customer model
      customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    },
    items: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        sku: { type: String, required: true }, // Added for inventory matching
        name: { type: String, required: true },
        variant_info: { type: String }, // For size/color if needed
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // Store snapshot of price in paise at time of purchase
        total_price: { type: Number, required: true }, // quantity * price
        gst_rate: { type: Number, default: 0 },
        gst_amount: { type: Number, default: 0 },
      },
    ],
    total_amount: {
      type: Number,
      required: true,
      description: "Total amount in paise",
    },
    coupon: {
      code: { type: String },
      name: { type: String },
      discount_type: { type: String, enum: ["percentage", "flat"] },
      discount_value: { type: Number },
      discount_amount: { type: Number, default: 0 },
      min_order_value: { type: Number },
      max_discount: { type: Number },
      applies_to_all: { type: Boolean },
    },
    items_count: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "created",
        "confirmed",
        "paid",
        "shipped",
        "delivered",
        "return_requested",
        "return_in_progress",
        "return_rejected",
        "cancelled",
        "refunded",
        "replaced",
        "failed"
      ],
      default: "created",
    },
    payment_method: {
      type: String,
      enum: ["razorpay", "phonepe", "cod"],
      default: "phonepe",
      index: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "captured", "failed", "refunded", "cod_pending", "cod_collected"],
      default: "pending",
      index: true,
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    shipping_address: {
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    shipping_details: {
      courier_name: String,
      tracking_number: String,
      tracking_url: String,
      shipped_at: Date,
      delivered_at: Date,
    },
    billing_address: {
      // Optional, usually same as shipping for simple e-com
      line1: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    history: [
      {
        status: String,
        changed_by: String, // 'system' or 'admin'
        timestamp: { type: Date, default: Date.now },
        reason: String,
      }
    ],
    return_request: {
      type: {
        type: String,
        enum: ["refund", "replace"],
      },
      reason: String,
      note: String,
      status: {
        type: String,
        enum: [
          "requested",
          "accepted",
          "rejected",
          "refunded",
          "replaced",
        ],
      },
      requested_at: Date,
      decided_at: Date,
      resolved_at: Date,
      decision_note: String,
      decided_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    },
    replacement_of: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {
    timestamps: true,
  }
);

export type IOrder = mongoose.InferSchemaType<typeof orderSchema> & { _id: mongoose.Types.ObjectId };
export const Order = mongoose.model("Order", orderSchema);
