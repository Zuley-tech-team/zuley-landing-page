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
exports.sendOtpEmailDirect = sendOtpEmailDirect;
const resend_1 = require("resend");
const env_config_1 = require("../config/env.config");
const email_queue_model_1 = require("../models/email-queue.model");
// Initialize Resend with API Key only if present
const resend = env_config_1.env.RESEND_API_KEY ? new resend_1.Resend(env_config_1.env.RESEND_API_KEY) : null;
const escapeHtml = (value) => String(value !== null && value !== void 0 ? value : "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
const formatCurrency = (value) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
}).format(Number(value || 0));
const getTrackingUrl = (orderId) => {
    const baseUrl = env_config_1.env.FRONTEND_URL.split(',')[0].trim().replace(/\/$/, "");
    return `${baseUrl}/track-order?orderId=${encodeURIComponent(orderId)}`;
};
const buildBrandedEmail = (options) => {
    const greeting = options.customerName ? `Hi ${escapeHtml(options.customerName)},` : "Hi,";
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#1C1C1E;padding:30px 40px;text-align:center;">
              <h1 style="margin:0;color:#F5F0EB;font-size:28px;font-weight:700;letter-spacing:2px;">ZULEY</h1>
              <p style="margin:6px 0 0;color:#F5F0EB;opacity:0.65;font-size:12px;letter-spacing:1px;">SILVER CRAFTSMANSHIP</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 30px;">
              <h2 style="margin:0 0 8px;color:#1C1C1E;font-size:24px;font-weight:650;">${escapeHtml(options.title)}</h2>
              ${options.subtitle ? `<p style="margin:0 0 20px;color:#6B6B6B;font-size:15px;line-height:1.6;">${escapeHtml(options.subtitle)}</p>` : ""}
              <p style="margin:0 0 14px;color:#6B6B6B;font-size:15px;line-height:1.6;">${greeting}</p>
              <div style="margin:0;color:#1C1C1E;font-size:14px;line-height:1.7;">${options.contentHtml}</div>
              ${options.ctaLabel && options.ctaUrl ? `
              <div style="text-align:center;margin-top:22px;">
                <a href="${escapeHtml(options.ctaUrl)}" style="display:inline-block;background:#1C1C1E;color:#ffffff;text-decoration:none;border-radius:8px;padding:13px 22px;font-size:14px;font-weight:650;">${escapeHtml(options.ctaLabel)}</a>
              </div>` : ""}
            </td>
          </tr>
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
};
// OTP Email — sent directly, not via queue (time-critical)
function sendOtpEmailDirect(email, otp, isNewUser) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const result = yield resend.emails.send({
            from: env_config_1.env.EMAIL_FROM,
            to: email,
            subject: `${otp} — Your Zuley Login OTP`,
            html,
        });
        if (result.error) {
            throw new Error(`Failed to send OTP email: ${result.error.message}`);
        }
    });
}
class EmailService {
    /**
     * Add an email job to the queue
     */
    static addToQueue(type, recipientEmail, orderId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.ENABLED_EMAIL_TYPES.has(type)) {
                    console.log(`[EmailService] Skipping disabled email type: ${type}`);
                    return null;
                }
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
                const enabledEmailTypes = Array.from(this.ENABLED_EMAIL_TYPES);
                // Retire older pending jobs for disabled types so they are never sent.
                yield email_queue_model_1.EmailQueue.updateMany({
                    status: email_queue_model_1.EmailStatus.PENDING,
                    email_type: { $nin: enabledEmailTypes },
                }, {
                    $set: {
                        status: email_queue_model_1.EmailStatus.FAILED,
                        error: "Email type disabled by configuration",
                        last_attempt: new Date(),
                    },
                    $inc: { attempts: 1 },
                });
                // Find pending jobs
                // Limit to 5 at a time to avoid overwhelming the API
                const jobs = yield email_queue_model_1.EmailQueue.find({
                    status: email_queue_model_1.EmailStatus.PENDING,
                    email_type: { $in: enabledEmailTypes },
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
            case email_queue_model_1.EmailType.INVOICE:
                const orderTrackingUrl = payload.trackingUrl || getTrackingUrl(payload.orderId);
                return {
                    subject: `Invoice ${payload.invoiceNumber} | Order ${payload.orderId} - Zuley`,
                    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Zuley invoice</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#1C1C1E;padding:30px 40px;text-align:center;">
              <h1 style="margin:0;color:#F5F0EB;font-size:28px;font-weight:700;letter-spacing:2px;">ZULEY</h1>
              <p style="margin:6px 0 0;color:#F5F0EB;opacity:0.65;font-size:12px;letter-spacing:1px;">SILVER CRAFTSMANSHIP</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 30px;">
              <h2 style="margin:0 0 10px;color:#1C1C1E;font-size:24px;font-weight:650;">Invoice generated</h2>
              <p style="margin:0 0 22px;color:#6B6B6B;font-size:15px;line-height:1.6;">Hi ${escapeHtml(payload.customerName)}, your order has been placed successfully. Your invoice PDF is attached to this email.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F6;border:1px solid #E8E0D8;border-radius:12px;padding:0 18px;margin:0 0 22px;">
                <tr>
                  <td style="padding:16px 0;">
                    <p style="margin:0 0 6px;color:#6B6B6B;font-size:13px;">Order ID</p>
                    <p style="margin:0;color:#1C1C1E;font-size:16px;font-weight:700;">${escapeHtml(payload.orderId)}</p>
                  </td>
                  <td style="padding:16px 0;text-align:right;">
                    <p style="margin:0 0 6px;color:#6B6B6B;font-size:13px;">Invoice</p>
                    <p style="margin:0;color:#1C1C1E;font-size:16px;font-weight:700;">${escapeHtml(payload.invoiceNumber)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 0;border-top:1px solid #E8E0D8;">
                    <p style="margin:0 0 6px;color:#6B6B6B;font-size:13px;">Payment</p>
                    <p style="margin:0;color:#1C1C1E;font-size:15px;font-weight:600;">${payload.paymentMethod === "cod" ? "Payment on Delivery" : "Online Payment"}</p>
                  </td>
                  <td style="padding:16px 0;border-top:1px solid #E8E0D8;text-align:right;">
                    <p style="margin:0 0 6px;color:#6B6B6B;font-size:13px;">Amount</p>
                    <p style="margin:0;color:#1C1C1E;font-size:15px;font-weight:600;">${formatCurrency(payload.amount)}</p>
                  </td>
                </tr>
              </table>
              <div style="text-align:center;">
                <a href="${escapeHtml(orderTrackingUrl)}" style="display:inline-block;background:#1C1C1E;color:#ffffff;text-decoration:none;border-radius:8px;padding:13px 22px;font-size:14px;font-weight:650;">Track your order</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
                    attachments: payload.pdfPath ? [{
                            filename: `Invoice-${payload.invoiceNumber}.pdf`,
                            path: payload.pdfPath,
                            contentType: "application/pdf",
                        }] : [],
                };
            case email_queue_model_1.EmailType.ORDER_CONFIRMATION:
                return {
                    subject: `Order Confirmed | ${payload.orderId} - Zuley`,
                    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your order is confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr><td style="background-color:#1C1C1E;padding:30px 40px;text-align:center;"><h1 style="margin:0;color:#F5F0EB;font-size:28px;font-weight:700;letter-spacing:2px;">ZULEY</h1></td></tr>
          <tr>
            <td style="padding:34px 40px;">
              <h2 style="margin:0 0 10px;color:#1C1C1E;font-size:24px;font-weight:650;">Order confirmed</h2>
              <p style="margin:0 0 16px;color:#6B6B6B;font-size:15px;line-height:1.6;">Hi ${escapeHtml(payload.customerName)}, your order <strong>${escapeHtml(payload.orderId)}</strong> has been confirmed and is now being processed.</p>
              <p style="margin:0 0 22px;color:#6B6B6B;font-size:14px;">Amount: <strong>${formatCurrency(payload.total)}</strong></p>
              <a href="${escapeHtml(payload.trackingUrl || getTrackingUrl(payload.orderId))}" style="display:inline-block;background:#1C1C1E;color:#ffffff;text-decoration:none;border-radius:8px;padding:13px 22px;font-size:14px;font-weight:650;">Track your order</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
                };
            case email_queue_model_1.EmailType.SHIPPING_CONFIRMATION:
                return {
                    subject: `Order Shipped | ${payload.orderId} - Zuley`,
                    html: buildBrandedEmail({
                        title: "Order shipped",
                        subtitle: `Order ${payload.orderId} is now on the way.`,
                        customerName: payload.customerName,
                        contentHtml: `
<p style="margin:0 0 8px;"><strong>Order ID:</strong> ${escapeHtml(payload.orderId)}</p>
<p style="margin:0 0 8px;"><strong>Courier:</strong> ${escapeHtml(payload.courierName || "Shipping Partner")}</p>
<p style="margin:0;"><strong>Tracking Number:</strong> ${escapeHtml(payload.trackingNumber || "TBD")}</p>`,
                        ctaLabel: "Track your order",
                        ctaUrl: payload.trackingUrl || getTrackingUrl(payload.orderId),
                    }),
                };
            case email_queue_model_1.EmailType.DELIVERY_CONFIRMATION:
                return {
                    subject: `Order Delivered | ${payload.orderId} - Zuley`,
                    html: buildBrandedEmail({
                        title: "Order delivered",
                        subtitle: `Order ${payload.orderId} has been delivered.`,
                        customerName: payload.customerName,
                        contentHtml: `
<p style="margin:0 0 8px;"><strong>Order ID:</strong> ${escapeHtml(payload.orderId)}</p>
<p style="margin:0;">Thank you for shopping with Zuley.</p>`,
                        ctaLabel: "Track your order",
                        ctaUrl: getTrackingUrl(payload.orderId),
                    }),
                };
            case email_queue_model_1.EmailType.REFUND_CONFIRMATION:
                return {
                    subject: `${payload.subjectPrefix || "Order Update"} | ${payload.orderId} - Zuley`,
                    html: buildBrandedEmail({
                        title: payload.subjectPrefix || "Order update",
                        customerName: payload.customerName,
                        contentHtml: `
<p style="margin:0 0 8px;">${escapeHtml(payload.message || "Your order status has been updated.")}</p>
<p style="margin:0;"><strong>Order ID:</strong> ${escapeHtml(payload.orderId)}</p>`,
                        ctaLabel: "Track your order",
                        ctaUrl: getTrackingUrl(payload.orderId),
                    }),
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
EmailService.ENABLED_EMAIL_TYPES = new Set([
    email_queue_model_1.EmailType.ORDER_CONFIRMATION,
    email_queue_model_1.EmailType.INVOICE,
    email_queue_model_1.EmailType.SHIPPING_CONFIRMATION,
    email_queue_model_1.EmailType.DELIVERY_CONFIRMATION,
    email_queue_model_1.EmailType.REFUND_CONFIRMATION,
]);
