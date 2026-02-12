import { Resend } from "resend";
import { env } from "../config/env.config";
import { EmailQueue, EmailStatus, EmailType } from "../models/email-queue.model";
import { Order } from "../models/order.model";

// Initialize Resend with API Key only if present
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export class EmailService {
    /**
     * Add an email job to the queue
     */
    static async addToQueue(
        type: EmailType,
        recipientEmail: string,
        orderId: any,
        payload: any
    ) {
        try {
            const emailJob = await EmailQueue.create({
                email_type: type,
                recipient_email: recipientEmail,
                order_id: orderId,
                payload: payload,
            });

            console.log(`[EmailService] Queued ${type} for order ${orderId}`);

            // Trigger processing in background (fire and forget)
            this.processQueue();

            return emailJob;
        } catch (error) {
            console.error("[EmailService] Failed to queue email:", error);
            // We don't throw here to avoid blocking the main flow (e.g. order creation)
            // but in a real system, we might want a fallback or alert.
        }
    }

    /**
     * Process pending email jobs
     */
    static async processQueue() {
        if (!resend) {
            console.warn("[EmailService] RESEND_API_KEY is missing. Skipping email processing.");
            return;
        }

        try {
            // Find pending jobs
            // Limit to 5 at a time to avoid overwhelming the API
            const jobs = await EmailQueue.find({
                status: EmailStatus.PENDING,
                attempts: { $lt: 3 }, // Max 3 retries
            })
                .sort({ createdAt: 1 })
                .limit(5);

            if (jobs.length === 0) return;

            console.log(`[EmailService] Processing ${jobs.length} email jobs...`);

            for (const job of jobs) {
                await this.sendEmail(job);
            }
        } catch (error) {
            console.error("[EmailService] Queue processing error:", error);
        }
    }

    /**
     * Send a single email job
     */
    private static async sendEmail(job: any) {
        try {
            const { subject, html, attachments } = this.generateContent(job.email_type, job.payload);

            const emailOptions: any = {
                from: env.EMAIL_FROM,
                to: job.recipient_email,
                subject: subject,
                html: html,
            };

            if (attachments && attachments.length > 0) {
                emailOptions.attachments = attachments;
            }

            const data = await resend!.emails.send(emailOptions);

            if (data.error) {
                throw new Error(data.error.message);
            }

            // Mark as sent
            job.status = EmailStatus.SENT;
            job.sent_at = new Date();
            job.attempts += 1;
            job.last_attempt = new Date();
            await job.save();

            console.log(`[EmailService] Sent ${job.email_type} to ${job.recipient_email}`);

        } catch (error: any) {
            console.error(`[EmailService] Failed to send email (ID: ${job._id}):`, error.message);

            job.attempts += 1;
            job.last_attempt = new Date();
            job.error = error.message;

            // If max attempts reached, mark as failed
            if (job.attempts >= 3) {
                job.status = EmailStatus.FAILED;
            }

            await job.save();
        }
    }

    /**
     * Generate email subject and body based on type
     */
    private static generateContent(type: EmailType, payload: any): { subject: string; html: string; attachments?: any[] } {
        switch (type) {
            case EmailType.ORDER_CONFIRMATION:
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

            case EmailType.SHIPPING_CONFIRMATION:
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

            case EmailType.DELIVERY_CONFIRMATION:
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

            case EmailType.INVOICE:
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
