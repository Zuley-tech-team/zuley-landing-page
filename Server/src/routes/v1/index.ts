import express from "express";
import paymentRoutes from "../../modules/payment/payment.routes";
import shippingRoutes from "../../routes/shipping.routes";
import adminRoutes from "../../modules/admin/admin.routes";
import orderRoutes from "./order.routes";
import inventoryPublicRoutes from "./inventory.routes";
import productsRoutes from "./products.routes";
import engagementRoutes from "./engagement.routes";
import reviewsRoutes from "./reviews.routes";
import userRoutes from "../../modules/user/user.routes";
import couponsRoutes from "./coupons.routes";

const router = express.Router();

router.use("/payments", paymentRoutes);
router.use("/shipping", shippingRoutes);
router.use("/admin", adminRoutes);
router.use("/orders", orderRoutes);
router.use("/inventory", inventoryPublicRoutes);
router.use("/products", productsRoutes);
router.use("/engagement", engagementRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/coupons", couponsRoutes);
router.use("/user", userRoutes);

export default router;
