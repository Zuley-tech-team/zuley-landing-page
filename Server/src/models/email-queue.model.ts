import mongoose from "mongoose";

export enum EmailType {
    ORDER_CONFIRMATION = "order_confirmation",
    INVOICE = "invoice",
    SHIPPING_CONFIRMATION = "shipping_confirmation",
    DELIVERY_CONFIRMATION = "delivery_confirmation",
    REFUND_CONFIRMATION = "refund_confirmation",
    RETURN_REQUESTED = "return_requested",
    RETURN_ACCEPTED = "return_accepted",
    RETURN_REJECTED = "return_rejected",
    RETURN_REFUNDED = "return_refunded",
    RETURN_REPLACED = "return_replaced",
    ADMIN_NEW_ORDER = "admin_new_order",
}

export enum EmailStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed",
}

const emailQueueSchema = new mongoose.Schema(
    {
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        payload: {
            type: mongoose.Schema.Types.Mixed,
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
    },
    {
        timestamps: true,
    }
);

// Index to quickly find pending jobs
emailQueueSchema.index({ status: 1, createdAt: 1 });

export const EmailQueue = mongoose.model("EmailQueue", emailQueueSchema);
