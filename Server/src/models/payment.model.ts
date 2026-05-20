import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    gateway_payment_id: {
      type: String,
      unique: true,
      sparse: true,
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
      enum: ["pending", "captured", "failed", "refunded", "cod_pending", "cod_collected"],
      default: "pending",
    },
    method: {
      type: String,
      description: "upi, card, netbanking, etc.",
    },
    payment_method: {
      type: String,
      enum: ["razorpay", "phonepe", "cod"],
      default: "phonepe",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      description: "Temporary storage for order details before payment is captured",
    },
    collected_at: {
      type: Date,
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
