import express from "express";
import paymentRoutes from "../../modules/payment/payment.routes";
import shippingRoutes from "../../routes/shipping.routes";
import adminRoutes from "../../modules/admin/admin.routes";
import orderRoutes from "./order.routes";
import inventoryPublicRoutes from "./inventory.routes";

const router = express.Router();

router.use("/payments", paymentRoutes);
router.use("/shipping", shippingRoutes);
router.use("/admin", adminRoutes);
router.use("/orders", orderRoutes);
router.use("/inventory", inventoryPublicRoutes);

export default router;
