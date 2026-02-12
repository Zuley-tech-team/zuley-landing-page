import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    gateway_payment_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    gateway_order_id: {
      type: String,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    amount: {
      type: Number,
      required: true,
      description: "Amount in paise",
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "captured", "failed", "refunded"],
      default: "pending",
    },
    method: {
      type: String,
      description: "upi, card, netbanking, etc.",
    },
    error_reason: {
      type: String,
    },
    gateway_response: {
      type: mongoose.Schema.Types.Mixed,
      description: "Full JSON response from gateway for debugging",
    },
    processed_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("Payment", paymentSchema);
