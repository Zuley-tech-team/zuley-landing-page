"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotificationCounts = void 0;
const order_model_1 = require("../../models/order.model");
const review_model_1 = require("../../models/review.model");
const product_model_1 = require("../../models/product.model");
const inventory_model_1 = require("../../models/inventory.model");
const corporate_lead_model_1 = require("../../models/corporate-lead.model");
const contact_inquiry_model_1 = require("../../models/contact-inquiry.model");
const newsletter_subscriber_model_1 = require("../../models/newsletter-subscriber.model");
const coupon_model_1 = require("../../models/coupon.model");
const admin_model_1 = require("../../models/admin.model");
const getNotificationCounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.admin.id;
        const admin = yield admin_model_1.Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const lastViewed = admin.notification_last_viewed || {
            dashboard: new Date(0),
            products: new Date(0),
            orders: new Date(0),
            reviews: new Date(0),
            inventory: new Date(0),
            leads: new Date(0),
            coupons: new Date(0)
        };
        // Helper to get date safely
        const getDate = (d) => d instanceof Date ? d : new Date(0);
        // 1. Orders: New orders OR status changes
        const ordersCount = yield order_model_1.Order.countDocuments({
            updatedAt: { $gt: getDate(lastViewed.orders) }
        });
        // 2. Reviews: New reviews
        const reviewsCount = yield review_model_1.Review.countDocuments({
            createdAt: { $gt: getDate(lastViewed.reviews) }
        });
        // 3. Inventory: New low stock warnings since last view
        const totalInventoryWarnings = yield inventory_model_1.Inventory.countDocuments({
            $or: [
                { quantity: { $lte: 0 } },
                { $expr: { $lte: ["$quantity", "$low_stock_threshold"] } }
            ],
            last_updated: { $gt: getDate(lastViewed.inventory) }
        });
        // 4. Leads: Combined corporate, contact, and newsletter
        const leadDate = getDate(lastViewed.leads);
        const [corpLeads, contactInqs, newsletterSub] = yield Promise.all([
            corporate_lead_model_1.CorporateLead.countDocuments({ createdAt: { $gt: leadDate } }),
            contact_inquiry_model_1.ContactInquiry.countDocuments({ createdAt: { $gt: leadDate } }),
            newsletter_subscriber_model_1.NewsletterSubscriber.countDocuments({ createdAt: { $gt: leadDate } })
        ]);
        const leadsCount = corpLeads + contactInqs + newsletterSub;
        // 5. Products: New products
        const productsCount = yield product_model_1.Product.countDocuments({
            createdAt: { $gt: getDate(lastViewed.products) }
        });
        // 6. Coupons: New coupons
        const couponsCount = yield coupon_model_1.Coupon.countDocuments({
            createdAt: { $gt: getDate(lastViewed.coupons) }
        });
        res.json({
            success: true,
            data: {
                dashboard: 0,
                products: productsCount,
                orders: ordersCount,
                reviews: reviewsCount,
                inventory: totalInventoryWarnings,
                leads: leadsCount,
                coupons: couponsCount
            }
        });
    }
    catch (error) {
        console.error("Error fetching notification counts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getNotificationCounts = getNotificationCounts;
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.admin.id;
        const { category } = req.body;
        if (!category) {
            return res.status(400).json({ message: "Category is required" });
        }
        const validCategories = ["dashboard", "products", "orders", "reviews", "inventory", "leads", "coupons"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }
        const updateField = `notification_last_viewed.${category}`;
        yield admin_model_1.Admin.findByIdAndUpdate(adminId, {
            $set: { [updateField]: new Date() }
        });
        res.json({ status: "success" });
    }
    catch (error) {
        console.error("Error marking category as read:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.markAsRead = markAsRead;
