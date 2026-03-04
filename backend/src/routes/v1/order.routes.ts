import { Router } from "express";
import { Order } from "../../models/order.model";
import { Shipping } from "../../models/shipping.model";

const router = Router();

/**
 * Public Order Tracking Endpoint
 * GET /api/v1/orders/:orderId/track
 * 
 * Returns order status, shipping details, and history
 * for customer-facing order tracking (no admin auth required).
 */
router.get("/:orderId/track", async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ order_id: orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found. Please check the order ID and try again.",
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
                items: order.items.map((item: any) => ({
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
