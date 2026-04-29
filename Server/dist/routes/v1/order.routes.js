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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const order_model_1 = require("../../models/order.model");
const shipping_model_1 = require("../../models/shipping.model");
const invoice_model_1 = require("../../models/invoice.model");
const order_placement_service_1 = require("../../services/order-placement.service");
const publicRateLimit_1 = require("../../middlewares/publicRateLimit");
const router = (0, express_1.Router)();
/**
 * Public COD Checkout Endpoint
 * POST /api/v1/orders/cod
 */
router.post("/cod", (0, publicRateLimit_1.publicRateLimit)({ windowMs: 15 * 60 * 1000, maxRequests: 5 }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const result = yield (0, order_placement_service_1.createCodOrder)(req.body);
        return res.status(201).json({
            success: true,
            message: "Cash on Delivery order placed successfully",
            data: {
                order_id: result.order.order_id,
                status: result.order.status,
                payment_method: result.order.payment_method,
                payment_status: result.order.payment_status,
                total_amount: result.order.total_amount,
                invoice_number: ((_a = result.invoice) === null || _a === void 0 ? void 0 : _a.invoiceNumber) || null,
            },
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to place COD order",
        });
    }
}));
/**
 * Public Invoice Download Endpoint
 * GET /api/v1/orders/:orderId/invoice
 *
 * Lets customers download the generated invoice from the order success
 * and tracking pages using their public order ID.
 */
router.get("/:orderId/invoice", (0, publicRateLimit_1.publicRateLimit)({ windowMs: 15 * 60 * 1000, maxRequests: 30 }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const invoiceNumber = String(req.query.invoiceNumber || "");
        const order = yield order_model_1.Order.findOne({ order_id: orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found. Please check the order ID and try again.",
            });
        }
        const query = {
            orderId: order._id,
            status: { $ne: "void" },
        };
        if (invoiceNumber) {
            query.invoiceNumber = invoiceNumber;
        }
        const invoice = yield invoice_model_1.Invoice.findOne(query).sort({ createdAt: -1 });
        if (!invoice || !invoice.pdfPath || !fs_1.default.existsSync(invoice.pdfPath)) {
            return res.status(404).json({
                success: false,
                message: "Invoice is not available for this order yet.",
            });
        }
        res.download(invoice.pdfPath, `${invoice.invoiceNumber}.pdf`);
    }
    catch (error) {
        console.error("Invoice Download Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to download invoice",
        });
    }
}));
/**
 * Public Order Tracking Endpoint
 * GET /api/v1/orders/:orderId/track
 *
 * Returns order status, shipping details, and history
 * for customer-facing order tracking (no admin auth required).
 */
router.get("/:orderId/track", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const order = yield order_model_1.Order.findOne({ order_id: orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found. Please check the order ID and try again.",
            });
        }
        // Try to find associated shipping record
        let shippingInfo = null;
        try {
            const shipping = yield shipping_model_1.Shipping.findOne({ orderId: order._id });
            if (shipping) {
                shippingInfo = {
                    courierName: shipping.courierName,
                    trackingNumber: shipping.trackingNumber,
                    trackingUrl: shipping.trackingUrl,
                    status: shipping.status,
                    shippedAt: shipping.shippedAt,
                    deliveredAt: shipping.deliveredAt,
                    history: shipping.history,
                };
            }
        }
        catch (_a) {
            // Shipping record may not exist yet — that's fine
        }
        res.json({
            success: true,
            data: {
                order_id: order.order_id,
                status: order.status,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                items: order.items.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                items_count: order.items_count,
                total_amount: order.total_amount,
                shipping_address: order.shipping_address
                    ? {
                        city: order.shipping_address.city,
                        state: order.shipping_address.state,
                        pincode: order.shipping_address.pincode,
                    }
                    : null,
                shipping: shippingInfo,
                history: order.history,
                created_at: order.createdAt,
            },
        });
    }
    catch (error) {
        console.error("Order Tracking Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order details",
        });
    }
}));
exports.default = router;
