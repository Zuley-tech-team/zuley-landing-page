import express from "express";
import paymentRoutes from "../../modules/payment/payment.routes";
import shippingRoutes from "../../routes/shipping.routes";
import adminRoutes from "../../modules/admin/admin.routes";

const router = express.Router();

router.use("/payments", paymentRoutes);
router.use("/shipping", shippingRoutes);
router.use("/admin", adminRoutes);

export default router;
