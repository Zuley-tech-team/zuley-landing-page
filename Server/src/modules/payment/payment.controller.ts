import { Request, Response } from "express";
import * as paymentService from "./payment.service";
import { env } from "../../config/env.config";

export const createOrder = async (req: Request, res: Response) => {
    try {
        if (!env.ENABLE_ONLINE_PAYMENTS) {
            return res.status(503).json({
                success: false,
                message: "Online payments are temporarily disabled. Please use Cash on Delivery.",
            });
        }

        const { amount, currency, receipt, notes } = req.body;

        // Basic Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const order = await paymentService.createPaymentOrder(
            amount,
            currency,
            receipt,
            notes
        );

        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: env.RAZORPAY_KEY_ID, // Send key context to frontend
        });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: "Failed to create payment order" });
    }
};

/**
 * POST /api/v1/payments/verify-payment
 * Verifies the Razorpay payment signature received from the client after checkout.
 * Must be called before marking any payment as confirmed on the frontend.
 */
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
            });
        }

        const isValid = paymentService.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            console.warn(`Signature mismatch for order ${razorpay_order_id} / payment ${razorpay_payment_id}`);
            return res.status(400).json({
                success: false,
                message: "Payment verification failed. Signature mismatch.",
            });
        }

        // Force sync with Razorpay to create order & invoice immediately since webhooks won't reach localhost
        // Force sync with Razorpay to create order & invoice immediately since webhooks won't reach localhost
        let syncResult;
        try {
            syncResult = await paymentService.syncPaymentAndCreateOrder(razorpay_order_id, razorpay_payment_id);
        } catch (syncError) {
            console.error("Failed to sync payment and create order:", syncError);
            // We don't fail the verification since payment was successful, it will be retried by webhook if in prod
        }

        console.log(`Payment verified and synced: order=${razorpay_order_id}, payment=${razorpay_payment_id}`);
        res.status(200).json({
            success: true,
            message: "Payment signature verified and synced successfully",
            order_id: syncResult?.orderId,
            invoice: syncResult?.invoiceNumber
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify payment",
        });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers["x-razorpay-signature"] as string;

        // Use rawBody captured by express.json verify option in index.ts
        // We cast req to any because rawBody is not in standard Request type
        const body = (req as any).rawBody;

        if (!body) {
            console.error("Missing raw body for webhook verification");
            return res.status(400).json({ message: "Missing raw body" });
        }

        const isValid = paymentService.verifyWebhookSignature(body, signature);

        if (!isValid) {
            console.warn("Webhook signature verification failed.");
            return res.status(400).json({ message: "Invalid signature" });
        }

        // Process the event using the parsed body
        await paymentService.processWebhookEvent(req.body);

        res.json({ status: "ok" });

    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Webhook processing failed" });
    }
};
