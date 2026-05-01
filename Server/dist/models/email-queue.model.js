"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailQueue = exports.EmailStatus = exports.EmailType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var EmailType;
(function (EmailType) {
    EmailType["ORDER_CONFIRMATION"] = "order_confirmation";
    EmailType["INVOICE"] = "invoice";
    EmailType["SHIPPING_CONFIRMATION"] = "shipping_confirmation";
    EmailType["DELIVERY_CONFIRMATION"] = "delivery_confirmation";
    EmailType["REFUND_CONFIRMATION"] = "refund_confirmation";
    EmailType["RETURN_REQUESTED"] = "return_requested";
    EmailType["RETURN_ACCEPTED"] = "return_accepted";
    EmailType["RETURN_REJECTED"] = "return_rejected";
    EmailType["RETURN_REFUNDED"] = "return_refunded";
    EmailType["RETURN_REPLACED"] = "return_replaced";
})(EmailType || (exports.EmailType = EmailType = {}));
var EmailStatus;
(function (EmailStatus) {
    EmailStatus["PENDING"] = "pending";
    EmailStatus["SENT"] = "sent";
    EmailStatus["FAILED"] = "failed";
})(EmailStatus || (exports.EmailStatus = EmailStatus = {}));
const emailQueueSchema = new mongoose_1.default.Schema({
    email_type: {
        type: String,
        enum: Object.values(EmailType),
        required: true,
    },
    recipient_email: {
        type: String,
        required: true,
    },
    order_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    payload: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(EmailStatus),
        default: EmailStatus.PENDING,
        index: true,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    last_attempt: {
        type: Date,
    },
    sent_at: {
        type: Date,
    },
    error: {
        type: String,
    },
}, {
    timestamps: true,
});
// Index to quickly find pending jobs
emailQueueSchema.index({ status: 1, createdAt: 1 });
exports.EmailQueue = mongoose_1.default.model("EmailQueue", emailQueueSchema);
