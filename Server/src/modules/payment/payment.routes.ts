import { Router } from "express";
import * as paymentController from "./payment.controller";

const router = Router();

// Route to create a payment order/intent
router.post("/create-order", paymentController.createOrder);

// Route to verify payment signature after client-side checkout success
router.post("/verify-payment", paymentController.verifyPayment);

// Webhook route - Gateway calls this
// Note: This route requires raw body for signature verification, 
// ensuring index.ts middleware captures it is crucial.
router.post("/webhook", paymentController.handleWebhook);

// Manual refund (placeholder for now as per requirements it's manual via dashboard, 
// but backend might need a trigger if we build an admin panel later. 
// For now, skipping as "Manual refund capability (via gateway dashboard is fine)" in requirements.)

export default router;
