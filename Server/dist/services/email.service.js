"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const resend_1 = require("resend");
const env_config_1 = require("../config/env.config");
const email_queue_model_1 = require("../models/email-queue.model");
// Initialize Resend with API Key only if present
const resend = env_config_1.env.RESEND_API_KEY ? new resend_1.Resend(env_config_1.env.RESEND_API_KEY) : null;
class EmailService {
    /**
     * Add an email job to the queue
     */
    static addToQueue(type, recipientEmail, orderId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const emailJob = yield email_queue_model_1.EmailQueue.create({
                    email_type: type,
                    recipient_email: recipientEmail,
                    order_id: orderId,
                    payload: payload,
                });
                console.log(`[EmailService] Queued ${type} for order ${orderId}`);
                // Trigger processing in background (fire and forget)
                this.processQueue();
                return emailJob;
            }
            catch (error) {
                console.error("[EmailService] Failed to queue email:", error);
                // We don't throw here to avoid blocking the main flow (e.g. order creation)
                // but in a real system, we might want a fallback or alert.
            }
        });
    }
    /**
     * Process pending email jobs
     */
    static processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resend) {
                console.warn("[EmailService] RESEND_API_KEY is missing. Skipping email processing.");
                return;
            }
            try {
                // Find pending jobs
                // Limit to 5 at a time to avoid overwhelming the API
                const jobs = yield email_queue_model_1.EmailQueue.find({
                    status: email_queue_model_1.EmailStatus.PENDING,
                    attempts: { $lt: 3 }, // Max 3 retries
                })
                    .sort({ createdAt: 1 })
                    .limit(5);
                if (jobs.length === 0)
                    return;
                console.log(`[EmailService] Processing ${jobs.length} email jobs...`);
                for (const job of jobs) {
                    yield this.sendEmail(job);
                }
            }
            catch (error) {
                console.error("[EmailService] Queue processing error:", error);
            }
        });
    }
    /**
     * Send a single email job
     */
    static sendEmail(job) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subject, html, attachments } = this.generateContent(job.email_type, job.payload);
                const emailOptions = {
                    from: env_config_1.env.EMAIL_FROM,
                    to: job.recipient_email,
                    subject: subject,
                    html: html,
                };
                if (attachments && attachments.length > 0) {
                    emailOptions.attachments = attachments;
                }
                const data = yield resend.emails.send(emailOptions);
                if (data.error) {
                    throw new Error(data.error.message);
                }
                // Mark as sent
                job.status = email_queue_model_1.EmailStatus.SENT;
                job.sent_at = new Date();
                job.attempts += 1;
                job.last_attempt = new Date();
                yield job.save();
                console.log(`[EmailService] Sent ${job.email_type} to ${job.recipient_email}`);
            }
            catch (error) {
                console.error(`[EmailService] Failed to send email (ID: ${job._id}):`, error.message);
                job.attempts += 1;
                job.last_attempt = new Date();
                job.error = error.message;
                // If max attempts reached, mark as failed
                if (job.attempts >= 3) {
                    job.status = email_queue_model_1.EmailStatus.FAILED;
                }
                yield job.save();
            }
        });
    }
    /**
     * Generate email subject and body based on type
     */
    static generateContent(type, payload) {
        switch (type) {
            case email_queue_model_1.EmailType.ORDER_CONFIRMATION:
                return {
                    subject: `Order Confirmed - ${payload.orderId} | Zuley`,
                    html: `
            <h1>✓ Order Confirmed!</h1>
            <p>Hi ${payload.customerName},</p>
            <p>Thank you for your order. Here's what you purchased:</p>
            <p><strong>Order ID:</strong> ${payload.orderId}</p>
            <p><strong>Total:</strong> ₹${payload.total}</p>
            <hr />
            <p>We'll email you when your order ships.</p>
            <p>— Team Zuley</p>
          `,
                };
            case email_queue_model_1.EmailType.SHIPPING_CONFIRMATION:
                return {
                    subject: `Your Order is On Its Way! - ${payload.orderId} | Zuley`,
                    html: `
            <h1>📦 Shipped!</h1>
            <p>Hi ${payload.customerName},</p>
            <p>Great news! Your order is on its way.</p>
            <p><strong>Courier:</strong> ${payload.courierName}</p>
            <p><strong>Tracking Number:</strong> ${payload.trackingNumber}</p>
            <p><a href="${payload.trackingUrl}">Track your package</a></p>
            <p>— Team Zuley</p>
          `,
                };
            case email_queue_model_1.EmailType.DELIVERY_CONFIRMATION:
                return {
                    subject: `Order Delivered! - ${payload.orderId} | Zuley`,
                    html: `
            <h1>✓ Delivered!</h1>
            <p>Hi ${payload.customerName},</p>
            <p>Your order has been delivered!</p>
            <p><strong>Order ID:</strong> ${payload.orderId}</p>
            <p>We hope you love your purchase. 💎</p>
            <p>— Team Zuley</p>
          `,
                };
            case email_queue_model_1.EmailType.INVOICE:
                return {
                    subject: `Invoice ${payload.invoiceNumber} - Zuley`,
                    html: `
            <p>Hi ${payload.customerName},</p>
            <p>Please find attached the GST invoice for your recent purchase.</p>
            <p><strong>Invoice Number:</strong> ${payload.invoiceNumber}</p>
            <p><strong>Order ID:</strong> ${payload.orderId}</p>
            <p><strong>Amount:</strong> ₹${payload.amount}</p>
            <p>For any queries, reply to this email.</p>
            <p>— Team Zuley</p>
          `,
                    attachments: payload.pdfPath ? [{
                            filename: `Invoice-${payload.invoiceNumber}.pdf`,
                            path: payload.pdfPath,
                        }] : [],
                };
            default:
                return {
                    subject: "Notification from Zuley",
                    html: "<p>You have a new notification.</p>",
                    attachments: [],
                };
        }
    }
}
exports.EmailService = EmailService;
