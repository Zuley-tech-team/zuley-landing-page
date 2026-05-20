import { Request, Response } from "express";
import { Order } from "../../models/order.model";
import { AdminLogger } from "../../services/admin-logger.service";
import { Customer } from "../../models/customer.model";
import { Invoice } from "../../models/invoice.model";
import { InvoiceService } from "../../services/invoice.service";
import { EmailService } from "../../services/email.service";
import { EmailType } from "../../models/email-queue.model";
import { restoreStock } from "../inventory/inventory.service";
import { Payment } from "../../models/payment.model";
import fs from "fs";

const TERMINAL_STATUSES = new Set(["cancelled", "refunded"]);

const triggerOrderStatusSideEffects = async (
    order: any,
    oldStatus: string,
    newStatus: string,
    note?: string
) => {
    if (oldStatus === newStatus) {
        return;
    }

    const customerEmail = order.customer_details?.email;
    const customerName = order.customer_details?.name || "Customer";

    if (newStatus === "confirmed") {
        order.payment_status = order.payment_method === "cod" ? order.payment_status : "captured";
        await order.save();

        if (order.payment_id && order.payment_method !== "cod") {
            await Payment.findByIdAndUpdate(order.payment_id, {
                status: "captured",
            });
        }

        if (customerEmail) {
            await EmailService.addToQueue(
                EmailType.ORDER_CONFIRMATION,
                customerEmail,
                order._id,
                {
                    orderId: order.order_id,
                    customerName,
                    total: order.total_amount / 100,
                }
            );
        }
    }

    if (newStatus === "shipped") {
        if (!order.shipping_details) {
            order.shipping_details = {};
        }
        if (!order.shipping_details.shipped_at) {
            order.shipping_details.shipped_at = new Date();
            await order.save();
        }

        if (customerEmail) {
            await EmailService.addToQueue(
                EmailType.SHIPPING_CONFIRMATION,
                customerEmail,
                order._id,
                {
                    orderId: order.order_id,
                    customerName,
                    courierName: order.shipping_details?.courier_name || "Our Shipping Partner",
                    trackingNumber: order.shipping_details?.tracking_number || "Will be shared shortly",
                    trackingUrl: order.shipping_details?.tracking_url || "",
                }
            );
        }
    }

    if (newStatus === "delivered") {
        if (order.payment_method === "cod" && order.payment_status !== "cod_collected") {
            order.payment_status = "cod_collected";
            await Payment.findByIdAndUpdate(order.payment_id, {
                status: "cod_collected",
                collected_at: new Date(),
            });
        }

        if (!order.shipping_details) {
            order.shipping_details = {};
        }
        if (!order.shipping_details.delivered_at) {
            order.shipping_details.delivered_at = new Date();
            await order.save();
        }

        if (customerEmail) {
            await EmailService.addToQueue(
                EmailType.DELIVERY_CONFIRMATION,
                customerEmail,
                order._id,
                {
                    orderId: order.order_id,
                    customerName,
                }
            );
        }
    }

    if (TERMINAL_STATUSES.has(newStatus) && !TERMINAL_STATUSES.has(oldStatus)) {
        for (const item of order.items || []) {
            if (!item?.sku || !item?.quantity) {
                continue;
            }

            try {
                await restoreStock(
                    item.sku,
                    item.quantity,
                    newStatus === "refunded" ? "refund" : "cancellation",
                    order._id
                );
            } catch (stockError) {
                console.error(
                    `[OrderStatus] Failed to restore stock for ${order.order_id} (${item.sku}):`,
                    stockError
                );
            }
        }
    }

    if (newStatus === "cancelled" && customerEmail) {
        await EmailService.addToQueue(
            EmailType.REFUND_CONFIRMATION,
            customerEmail,
            order._id,
            {
                subjectPrefix: "Order Cancelled",
                orderId: order.order_id,
                customerName,
                message: `Your order ${order.order_id} has been cancelled as per our review. If this was unexpected, please contact support.`,
            }
        );
    }

    if (note) {
        console.log(`[OrderStatus] ${order.order_id} side effects processed with note: ${note}`);
    }
};

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

        const skip = (Number(page) - 1) * Number(limit);

        const orders = await Order.aggregate([
            { $match: query },
            {
                $addFields: {
                    returnPriority: {
                        $cond: [{ $eq: ["$status", "return_requested"] }, 0, 1],
                    },
                },
            },
            { $sort: { returnPriority: 1, createdAt: -1 } },
            { $skip: skip },
            { $limit: Number(limit) },
        ]);

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

        const invoice = await Invoice.findOne({ orderId: order._id }).select("invoiceNumber invoiceDate totalAmount status pdfPath");
        const replacementOrders = await Order.find({ replacement_of: order._id }).sort({ createdAt: -1 }).lean();
        const replacementOriginal = order.replacement_of
            ? await Order.findById(order.replacement_of).lean()
            : null;

        res.json({
            success: true,
            data: {
                ...order.toObject(),
                invoice,
                replacement_orders: replacementOrders,
                replacement_original: replacementOriginal,
            },
        });
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
        const validStatuses = [
            'created',
            'confirmed',
            'paid',
            'shipped',
            'delivered',
            'return_requested',
            'return_in_progress',
            'return_rejected',
            'replaced',
            'cancelled',
            'refunded',
        ];
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

        try {
            await triggerOrderStatusSideEffects(order, oldStatus, status, note);
        } catch (sideEffectError) {
            console.error("Order status side effect error:", sideEffectError);
        }

        res.json({ success: true, data: order });

    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};

export const confirmOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};

        const order = await Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status === "confirmed") {
            return res.status(400).json({ message: "Order is already confirmed" });
        }

        if (order.status === "cancelled" || order.status === "refunded" || order.status === "delivered") {
            return res.status(400).json({ message: "Cannot confirm this order from its current status" });
        }

        const previousStatus = order.status;
        order.status = "confirmed";
        order.history.push({
            status: "confirmed",
            changed_by: `admin:${req.admin.email}`,
            reason: note || "Order confirmed by admin",
            timestamp: new Date(),
        });
        await order.save();

        if (order.customer_details?.email) {
            await EmailService.addToQueue(
                EmailType.ORDER_CONFIRMATION,
                order.customer_details.email,
                order._id,
                {
                    orderId: order.order_id,
                    customerName: order.customer_details?.name || "Customer",
                    total: order.total_amount / 100,
                }
            );
        }

        await AdminLogger.logAction(
            req.admin._id,
            "CONFIRM_ORDER",
            "order",
            order.order_id,
            { oldStatus: previousStatus, newStatus: "confirmed", note: note || "Order confirmed by admin" },
            req
        );

        res.json({
            success: true,
            data: order,
            message: "Order confirmed successfully",
        });
    } catch (error) {
        console.error("Confirm Order Error:", error);
        res.status(500).json({ message: "Failed to confirm order" });
    }
};

export const markCodPaymentCollected = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};

        const order = await Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.payment_method !== "cod") {
            return res.status(400).json({ message: "Only COD orders can be marked as paid from admin." });
        }

        if (order.payment_status === "cod_collected") {
            return res.status(400).json({ message: "COD payment is already marked as collected." });
        }

        order.payment_status = "cod_collected";
        order.status = "paid";
        order.history.push({
            status: "paid",
            changed_by: `admin:${req.admin.email}`,
            reason: note || "COD payment collected",
            timestamp: new Date(),
        });
        await order.save();

        if (order.payment_id) {
            await Payment.findByIdAndUpdate(order.payment_id, {
                status: "cod_collected",
                collected_at: new Date(),
            });
        }

        if (order.customer_details?.email) {
            await EmailService.addToQueue(
                EmailType.REFUND_CONFIRMATION,
                order.customer_details.email,
                order._id,
                {
                    subjectPrefix: "Payment Received",
                    orderId: order.order_id,
                    customerName: order.customer_details?.name || "Customer",
                    message: `We have received your Cash on Delivery payment for order ${order.order_id}. Thank you.`,
                }
            );
        }

        await AdminLogger.logAction(
            req.admin._id,
            "MARK_COD_PAID",
            "order",
            order.order_id,
            { note: note || "COD payment collected by admin" },
            req
        );

        res.json({
            success: true,
            data: order,
            message: "COD payment marked as collected",
        });
    } catch (error) {
        console.error("Mark COD Paid Error:", error);
        res.status(500).json({ message: "Failed to mark COD payment as collected" });
    }
};

export const acceptReturnRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};

        const order = await Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status !== "return_requested") {
            return res.status(400).json({ message: "Return request is not pending for this order." });
        }

        order.status = "return_in_progress";
        if (!order.return_request) {
            order.return_request = {} as any;
        }
        order.return_request.status = "accepted";
        order.return_request.decided_at = new Date();
        order.return_request.decision_note = note || "Return request accepted";
        order.return_request.decided_by = req.admin._id;

        order.history.push({
            status: "return_in_progress",
            changed_by: `admin:${req.admin.email}`,
            reason: note || "Return request accepted",
            timestamp: new Date(),
        });

        await order.save();

        if (order.customer_details?.email) {
            await EmailService.addToQueue(
                EmailType.RETURN_ACCEPTED,
                order.customer_details.email,
                order._id,
                {
                    orderId: order.order_id,
                    customerName: order.customer_details?.name || "Customer",
                    type: order.return_request?.type || "refund",
                }
            );
        }

        return res.json({ success: true, data: order });
    } catch (error) {
        console.error("Accept Return Request Error:", error);
        return res.status(500).json({ message: "Failed to accept return request" });
    }
};

export const rejectReturnRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};

        const order = await Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status !== "return_requested") {
            return res.status(400).json({ message: "Return request is not pending for this order." });
        }

        order.status = "return_rejected";
        if (!order.return_request) {
            order.return_request = {} as any;
        }
        order.return_request.status = "rejected";
        order.return_request.decided_at = new Date();
        order.return_request.decision_note = note || "Return request rejected";
        order.return_request.decided_by = req.admin._id;

        order.history.push({
            status: "return_rejected",
            changed_by: `admin:${req.admin.email}`,
            reason: note || "Return request rejected",
            timestamp: new Date(),
        });

        await order.save();

        if (order.customer_details?.email) {
            await EmailService.addToQueue(
                EmailType.RETURN_REJECTED,
                order.customer_details.email,
                order._id,
                {
                    orderId: order.order_id,
                    customerName: order.customer_details?.name || "Customer",
                    note: note || "Return request rejected",
                }
            );
        }

        return res.json({ success: true, data: order });
    } catch (error) {
        console.error("Reject Return Request Error:", error);
        return res.status(500).json({ message: "Failed to reject return request" });
    }
};

export const markReturnRefunded = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};

        const order = await Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status !== "return_in_progress") {
            return res.status(400).json({ message: "Return is not in progress for this order." });
        }

        order.status = "refunded";
        order.payment_status = "refunded";
        if (!order.return_request) {
            order.return_request = {} as any;
        }
        order.return_request.status = "refunded";
        order.return_request.resolved_at = new Date();
        order.return_request.decision_note = note || order.return_request.decision_note;

        order.history.push({
            status: "refunded",
            changed_by: `admin:${req.admin.email}`,
            reason: note || "Return refunded",
            timestamp: new Date(),
        });

        await order.save();

        if (order.payment_id) {
            await Payment.findByIdAndUpdate(order.payment_id, {
                status: "refunded",
            });
        }

        if (order.customer_details?.email) {
            await EmailService.addToQueue(
                EmailType.RETURN_REFUNDED,
                order.customer_details.email,
                order._id,
                {
                    orderId: order.order_id,
                    customerName: order.customer_details?.name || "Customer",
                    note: note || "Return refunded",
                }
            );
        }

        return res.json({ success: true, data: order });
    } catch (error) {
        console.error("Mark Return Refunded Error:", error);
        return res.status(500).json({ message: "Failed to mark return as refunded" });
    }
};

export const markReturnReplaced = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};

        const order = await Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status !== "return_in_progress") {
            return res.status(400).json({ message: "Return is not in progress for this order." });
        }

        if (order.return_request?.type && order.return_request.type !== "replace") {
            return res.status(400).json({ message: "Return request is not marked for replacement." });
        }

        order.status = "replaced";
        if (!order.return_request) {
            order.return_request = {} as any;
        }
        order.return_request.status = "replaced";
        order.return_request.resolved_at = new Date();
        order.return_request.decision_note = note || order.return_request.decision_note;

        order.history.push({
            status: "replaced",
            changed_by: `admin:${req.admin.email}`,
            reason: note || "Return replaced",
            timestamp: new Date(),
        });

        await order.save();

        if (order.customer_details?.email) {
            await EmailService.addToQueue(
                EmailType.RETURN_REPLACED,
                order.customer_details.email,
                order._id,
                {
                    orderId: order.order_id,
                    customerName: order.customer_details?.name || "Customer",
                    note: note || "Replacement in progress",
                }
            );
        }

        return res.json({ success: true, data: order });
    } catch (error) {
        console.error("Mark Return Replaced Error:", error);
        return res.status(500).json({ message: "Failed to mark return as replaced" });
    }
};

export const getOrderInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({ order_id: id });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        let invoice: any = await Invoice.findOne({ orderId: order._id });

        if (!invoice) {
            const customer = await Customer.findById(order.customer_details?.customer_id);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found for invoice generation" });
            }

            invoice = await InvoiceService.createInvoice(order, customer as any);
        }

        res.json({
            success: true,
            data: {
                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: invoice.invoiceDate,
                totalAmount: invoice.totalAmount,
                status: invoice.status,
                pdfPath: invoice.pdfPath, // Added for frontend Cloudinary check
                url: invoice.pdfPath?.startsWith("http") ? invoice.pdfPath : undefined, // Added explicit url
                downloadUrl: `/api/v1/admin/orders/${encodeURIComponent(order.order_id)}/invoice/download`,
            },
        });
    } catch (error) {
        console.error("Get Order Invoice Error:", error);
        res.status(500).json({ message: "Failed to fetch invoice" });
    }
};

export const downloadOrderInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({ order_id: id });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        let invoice: any = await Invoice.findOne({ orderId: order._id });

        if (!invoice) {
            const customer = await Customer.findById(order.customer_details?.customer_id);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found for invoice generation" });
            }

            invoice = await InvoiceService.createInvoice(order, customer as any);
        }

        if (!invoice.pdfPath) {
            return res.status(404).json({ message: "Invoice PDF not found" });
        }

        // Cloudinary URL — return it as JSON so the client can open it directly without CORS issues
        if (invoice.pdfPath.startsWith("http")) {
            return res.json({
                success: true,
                url: invoice.pdfPath,
                invoiceNumber: invoice.invoiceNumber,
            });
        }

        // Legacy: local file path — stream from disk
        if (!fs.existsSync(invoice.pdfPath)) {
            return res.status(404).json({ message: "Invoice PDF not found on disk" });
        }

        res.download(invoice.pdfPath, `Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
        console.error("Download Order Invoice Error:", error);
        res.status(500).json({ message: "Failed to download invoice" });
    }
};
