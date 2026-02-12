import { Request, Response } from "express";
import { Order } from "../../models/order.model";
import { AdminLogger } from "../../services/admin-logger.service";

export const getOrders = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        const query: any = {};

        // Filter by status
        if (status && status !== 'All') {
            query.status = status;
        }

        // Search logic (Order ID, Customer Name/Email/Phone)
        if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            query.$or = [
                { order_id: searchRegex },
                { "customer_details.name": searchRegex },
                { "customer_details.email": searchRegex },
                { "customer_details.phone": searchRegex },
            ];
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                current: Number(page),
                total: Math.ceil(total / Number(limit)),
                count: total,
            }
        });
    } catch (error) {
        console.error("Get Orders Error:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({ order_id: id }).populate('payment_id');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        console.error("Get Order Detail Error:", error);
        res.status(500).json({ message: "Failed to fetch order details" });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        // Validate Status transition (simplified for now)
        const validStatuses = ['paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const oldStatus = order.status;
        order.status = status;

        // Add to history
        order.history.push({
            status: status,
            changed_by: `admin:${req.admin.email}`,
            reason: note || "Admin status update",
            timestamp: new Date()
        });

        await order.save();

        // Log Admin Action
        await AdminLogger.logAction(
            req.admin._id,
            "UPDATE_STATUS",
            "order",
            order.order_id,
            { oldStatus, newStatus: status, note },
            req
        );

        // TODO: Trigger side effects if needed (e.g. email on delivered/shipped if not handled by dedicated routes)
        // Actually, shipping.controller handles shipped/delivered with specific logic (tracking etc).
        // This endpoint is a generic override. We should warn admin or handle logic.
        // For now, it's a brute-force update.

        res.json({ success: true, data: order });

    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};
