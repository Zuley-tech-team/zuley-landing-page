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
            merchant_order_id: order.merchantOrderId,
            amount: order.amount,
            redirect_url: order.redirectUrl
        });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: "Failed to create payment order" });
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { merchant_order_id } = req.body;

        if (!merchant_order_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: merchant_order_id",
            });
        }

        // Force sync with PhonePe to create order & invoice immediately
        let syncResult;
        try {
            syncResult = await paymentService.syncPaymentAndCreateOrder(merchant_order_id);
        } catch (syncError) {
            console.error("Failed to sync payment and create order:", syncError);
            return res.status(400).json({
                success: false,
                message: "Payment verification failed or payment is not completed.",
            });
        }

        if (!syncResult.orderId) {
             return res.status(400).json({
                success: false,
                message: "Payment is pending or failed.",
            });
        }

        console.log(`Payment verified and synced: merchant_order_id=${merchant_order_id}`);
        res.status(200).json({
            success: true,
            message: "Payment verified and synced successfully",
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
        const signature = req.headers["x-verify"] as string || req.headers["authorization"] as string;
        
        // Use rawBody captured by express.json verify option in index.ts
        const body = (req as any).rawBody;

        if (!body) {
            console.error("Missing raw body for webhook verification");
            return res.status(400).json({ message: "Missing raw body" });
        }

        const isValid = await paymentService.processWebhookEvent(signature, body);

        if (!isValid) {
            console.warn("Webhook signature verification failed.");
            return res.status(400).json({ message: "Invalid signature" });
        }

        res.json({ status: "ok" });

    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Webhook processing failed" });
    }
};
