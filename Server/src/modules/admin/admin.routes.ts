import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticateAdmin } from "../../middlewares/admin.middleware";
import multer from "multer";
import { publicRateLimit } from "../../middlewares/publicRateLimit";

const router = Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024,
	},
});

// Public Routes
router.post("/login", publicRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 8 }), authController.login);
router.post("/logout", authController.logout);

// Protected Routes
router.use(authenticateAdmin);

router.get("/me", authController.getMe);
 
// Notification Routes
import * as notificationController from "./notification.controller";
router.get("/notifications/counts", notificationController.getNotificationCounts);
router.post("/notifications/mark-read", notificationController.markAsRead);

// Dashboard Stats
import * as productsController from "./products.controller";
router.get("/dashboard/stats", productsController.getDashboardStats);

// Product Routes
router.get("/products", productsController.getProducts);
router.get("/products/:id", productsController.getProductById);
router.post("/products/images", upload.array("images", 10), productsController.uploadProductImages);
router.post("/products", productsController.createProduct);
router.put("/products/:id", productsController.updateProduct);
router.patch("/products/:id/toggle", productsController.toggleProductStatus);
router.delete("/products/:id", productsController.deleteProduct);

// Order Routes
import * as orderController from "./order.controller";
router.get("/orders", orderController.getOrders);
router.get("/orders/:id", orderController.getOrderById);
router.get("/orders/:id/invoice", orderController.getOrderInvoice);
router.get("/orders/:id/invoice/download", orderController.downloadOrderInvoice);
router.post("/orders/:id/confirm", orderController.confirmOrder);
router.post("/orders/:id/mark-cod-paid", orderController.markCodPaymentCollected);
router.put("/orders/:id/status", orderController.updateOrderStatus);
router.post("/orders/:id/return/accept", orderController.acceptReturnRequest);
router.post("/orders/:id/return/reject", orderController.rejectReturnRequest);
router.post("/orders/:id/return/refunded", orderController.markReturnRefunded);
router.post("/orders/:id/return/replaced", orderController.markReturnReplaced);

// Inventory Routes
import * as inventoryController from "./inventory.controller";
router.get("/inventory", inventoryController.getInventory);
router.post("/inventory/stock", inventoryController.updateStock);

// Logs Routes
import * as logsController from "./logs.controller";
router.get("/logs", logsController.getSystemLogs);

// Engagement Routes
import * as engagementController from "./engagement.controller";
router.get("/engagement/stats", engagementController.getEngagementStats);
router.get("/engagement/contact-inquiries", engagementController.getContactInquiries);
router.patch("/engagement/contact-inquiries/:id/status", engagementController.updateContactInquiryStatus);
router.get("/engagement/corporate-leads", engagementController.getCorporateLeads);
router.patch("/engagement/corporate-leads/:id/status", engagementController.updateCorporateLeadStatus);
router.get("/engagement/newsletter-subscribers", engagementController.getNewsletterSubscribers);

// User/Lead Routes
import * as usersController from "./users.controller";
router.get("/users", usersController.getUsers);
router.get("/users/:id", usersController.getUserDetails);

// Review Routes
import * as reviewController from "./review.controller";
router.get("/reviews", reviewController.getReviews);
router.patch("/reviews/:id/approve", reviewController.approveReview);
router.patch("/reviews/:id/reject", reviewController.rejectReview);

// Coupon Routes
import * as couponsController from "./coupons.controller";
router.get("/coupons", couponsController.getCoupons);
router.post("/coupons", couponsController.createCoupon);
router.put("/coupons/:id", couponsController.updateCoupon);

export default router;
