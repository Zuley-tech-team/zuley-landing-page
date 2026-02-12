import { Request, Response } from "express";
import * as paymentService from "./payment.service";
import { env } from "../../config/env.config";

export const createOrder = async (req: Request, res: Response) => {
    try {
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
