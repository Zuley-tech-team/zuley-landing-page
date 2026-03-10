"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.Mixed,
        description: "Full JSON response from gateway for debugging",
    },
    processed_at: {
        type: Date,
    },
}, {
    timestamps: true,
});
exports.Payment = mongoose_1.default.model("Payment", paymentSchema);
