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
router.put("/orders/:id/status", orderController.updateOrderStatus);

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

export default router;
