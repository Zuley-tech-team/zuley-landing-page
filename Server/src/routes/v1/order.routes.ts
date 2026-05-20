import { Router } from "express";
import fs from "fs";
import { Order } from "../../models/order.model";
import { Shipping } from "../../models/shipping.model";
import { Invoice } from "../../models/invoice.model";
import { createCodOrder } from "../../services/order-placement.service";
import { publicRateLimit } from "../../middlewares/publicRateLimit";
import { authenticateUser } from "../../middlewares/user.middleware";

const router = Router();

/**
 * Public COD Checkout Endpoint
 * POST /api/v1/orders/cod
 */
router.post("/cod", publicRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 }), async (req, res) => {
    try {
        const result = await createCodOrder(req.body);

        return res.status(201).json({
            success: true,
            message: "Cash on Delivery order placed successfully",
            data: {
                order_id: result.order.order_id,
                status: result.order.status,
                payment_method: result.order.payment_method,
                payment_status: result.order.payment_status,
                total_amount: result.order.total_amount,
                invoice_number: result.invoice?.invoiceNumber || null,
            },
        });
    } catch (error: any) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to place COD order",
        });
    }
});

/**
 * Authenticated Invoice Download Endpoint
 * GET /api/v1/orders/:orderId/invoice
 *
 * Lets logged-in customers download their own invoice.
 * Redirects to Cloudinary URL for new invoices; streams from disk for legacy ones.
 */
router.get("/:orderId/invoice", authenticateUser, publicRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 30 }), async (req, res) => {
    try {
        const { orderId } = req.params;
        const invoiceNumber = String(req.query.invoiceNumber || "");
        const userEmail = req.user?.email;

        const order = await Order.findOne({ order_id: orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found. Please check the order ID and try again.",
            });
        }

        // Ownership check
        if (order.customer_details?.email !== userEmail) {
            return res.status(403).json({
                success: false,
                message: "You are not authorised to access this invoice.",
            });
        }

        const query: any = {
            orderId: order._id,
            status: { $ne: "void" },
        };

        if (invoiceNumber) {
            query.invoiceNumber = invoiceNumber;
        }

        const invoice = await Invoice.findOne(query).sort({ createdAt: -1 });
        if (!invoice || !invoice.pdfPath) {
            return res.status(404).json({
                success: false,
                message: "Invoice is not available for this order yet.",
            });
        }

        // Cloudinary URL — return as JSON so client can open it without CORS issues
        if (invoice.pdfPath.startsWith("http")) {
            return res.json({
                success: true,
                url: invoice.pdfPath,
                invoiceNumber: invoice.invoiceNumber,
            });
        }

        // Legacy: local file path — stream from disk
        if (!fs.existsSync(invoice.pdfPath)) {
            return res.status(404).json({
                success: false,
                message: "Invoice file is no longer available on disk.",
            });
        }
        res.download(invoice.pdfPath, `${invoice.invoiceNumber}.pdf`);
    } catch (error) {
        console.error("Invoice Download Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to download invoice",
        });
    }
});

/**
 * Authenticated Order Tracking Endpoint
 * GET /api/v1/orders/:orderId/track
 *
 * Requires login. Returns order tracking info only if the order belongs
 * to the logged-in user's email.
 */
router.get("/:orderId/track", authenticateUser, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userEmail = req.user?.email;

        const order = await Order.findOne({ order_id: orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found. Please check the order ID and try again.",
            });
        }

        // Ownership check — ensure this order belongs to the logged-in user
        if (order.customer_details?.email !== userEmail) {
            return res.status(403).json({
                success: false,
                message: "You are not authorised to track this order.",
            });
        }

        // Try to find associated shipping record
        let shippingInfo = null;
        try {
            const shipping = await Shipping.findOne({ orderId: order._id });
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
        } catch {
            // Shipping record may not exist yet — that's fine
        }

        res.json({
            success: true,
            data: {
                order_id: order.order_id,
                status: order.status,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                items: order.items.map((item: any) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    variant_info: item.variant_info,
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
                created_at: (order as any).createdAt,
            },
        });
    } catch (error) {
        console.error("Order Tracking Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order details",
        });
    }
});

export default router;
