"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("./auth.controller"));
const admin_middleware_1 = require("../../middlewares/admin.middleware");
const multer_1 = __importDefault(require("multer"));
const publicRateLimit_1 = require("../../middlewares/publicRateLimit");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
// Public Routes
router.post("/login", (0, publicRateLimit_1.publicRateLimit)({ windowMs: 15 * 60 * 1000, maxRequests: 8 }), authController.login);
router.post("/logout", authController.logout);
// Protected Routes
router.use(admin_middleware_1.authenticateAdmin);
router.get("/me", authController.getMe);
// Dashboard Stats
const productsController = __importStar(require("./products.controller"));
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
const orderController = __importStar(require("./order.controller"));
router.get("/orders", orderController.getOrders);
router.get("/orders/:id", orderController.getOrderById);
router.get("/orders/:id/invoice", orderController.getOrderInvoice);
router.get("/orders/:id/invoice/download", orderController.downloadOrderInvoice);
router.post("/orders/:id/confirm", orderController.confirmOrder);
router.post("/orders/:id/mark-cod-paid", orderController.markCodPaymentCollected);
router.put("/orders/:id/status", orderController.updateOrderStatus);
// Inventory Routes
const inventoryController = __importStar(require("./inventory.controller"));
router.get("/inventory", inventoryController.getInventory);
router.post("/inventory/stock", inventoryController.updateStock);
// Logs Routes
const logsController = __importStar(require("./logs.controller"));
router.get("/logs", logsController.getSystemLogs);
// Engagement Routes
const engagementController = __importStar(require("./engagement.controller"));
router.get("/engagement/stats", engagementController.getEngagementStats);
router.get("/engagement/contact-inquiries", engagementController.getContactInquiries);
router.patch("/engagement/contact-inquiries/:id/status", engagementController.updateContactInquiryStatus);
router.get("/engagement/corporate-leads", engagementController.getCorporateLeads);
router.patch("/engagement/corporate-leads/:id/status", engagementController.updateCorporateLeadStatus);
router.get("/engagement/newsletter-subscribers", engagementController.getNewsletterSubscribers);
// User/Lead Routes
const usersController = __importStar(require("./users.controller"));
router.get("/users", usersController.getUsers);
router.get("/users/:id", usersController.getUserDetails);
exports.default = router;
