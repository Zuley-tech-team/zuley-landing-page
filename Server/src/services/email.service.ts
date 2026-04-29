import { Resend } from "resend";
import { env } from "../config/env.config";
import { EmailQueue, EmailStatus, EmailType } from "../models/email-queue.model";
import { Order } from "../models/order.model";

// Initialize Resend with API Key only if present
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// OTP Email — sent directly, not via queue (time-critical)
export async function sendOtpEmailDirect(email: string, otp: string, isNewUser: boolean): Promise<void> {
    // Always log the OTP to console for debugging (development)
    console.log(`\n🔐 [DEV] OTP for ${email}: ${otp} (expires in 10 min)\n`);

    if (!resend) {
        return;
    }

    const actionLabel = isNewUser ? "Create your Zuley account" : "Sign in to Zuley";
    const greeting = isNewUser ? "Welcome to Zuley!" : "Welcome back!";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Zuley OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1C1C1E;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#F5F0EB;font-size:28px;font-weight:700;letter-spacing:2px;">ZULEY</h1>
              <p style="margin:6px 0 0;color:#F5F0EB;opacity:0.6;font-size:13px;letter-spacing:1px;">SILVER CRAFTSMANSHIP</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;color:#1C1C1E;font-size:22px;font-weight:600;">${greeting}</h2>
              <p style="margin:0 0 24px;color:#6B6B6B;font-size:15px;line-height:1.6;">${actionLabel}. Use the OTP below to continue. It expires in <strong>10 minutes</strong>.</p>
              <!-- OTP Box -->
              <div style="background:#F5F0EB;border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;">
                <p style="margin:0 0 8px;color:#6B6B6B;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Your One-Time Password</p>
                <p style="margin:0;color:#1C1C1E;font-size:42px;font-weight:700;letter-spacing:12px;">${otp}</p>
              </div>
              <p style="margin:0;color:#6B6B6B;font-size:13px;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your account is secure.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F5F0EB;padding:20px 40px;text-align:center;border-top:1px solid #E8E0D8;">
              <p style="margin:0;color:#9B9B9B;font-size:12px;">© ${new Date().getFullYear()} Zuley. All rights reserved.</p>
              <p style="margin:4px 0 0;color:#9B9B9B;font-size:12px;">zuley.in</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const result = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: email,
        subject: `${otp} — Your Zuley Login OTP`,
        html,
    });

    if (result.error) {
        throw new Error(`Failed to send OTP email: ${result.error.message}`);
    }
}

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
            <br />
            ${payload.invoiceNumber ? `
            <h3>📄 Your Invoice</h3>
            <p>We've attached your invoice (<strong>${payload.invoiceNumber}</strong>) for your records.</p>
            ` : ''}
            <br />
            <p>— Team Zuley</p>
          `,
                    attachments: payload.invoicePdfPath ? [{
                        filename: `Invoice-${payload.invoiceNumber}.pdf`,
                        path: payload.invoicePdfPath,
                    }] : [],
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
