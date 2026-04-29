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

    if (newStatus === "paid") {
        order.payment_status = order.payment_method === "cod" ? "cod_collected" : "captured";
        await order.save();

        if (order.payment_id) {
            await Payment.findByIdAndUpdate(order.payment_id, {
                status: order.payment_method === "cod" ? "cod_collected" : "captured",
                collected_at: order.payment_method === "cod" ? new Date() : undefined,
            });
        }

        const customer = await Customer.findById(order.customer_details?.customer_id);

        if (!customer) {
            console.warn(`[OrderStatus] Customer not found for order ${order.order_id}; skipping invoice generation.`);
        } else {
            const existingInvoice = await Invoice.findOne({ orderId: order._id });
            const invoice: any = existingInvoice || await InvoiceService.createInvoice(order, customer as any);

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

                await EmailService.addToQueue(
                    EmailType.INVOICE,
                    customerEmail,
                    order._id,
                    {
                        orderId: order.order_id,
                        customerName,
                        invoiceNumber: invoice.invoiceNumber,
                        amount: invoice.totalAmount,
                        pdfPath: invoice.pdfPath,
                    }
                );

                invoice.status = "emailed";
                await invoice.save();
            }
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

        let invoice: any = null;
        if (customerEmail) {
            const customer = await Customer.findById(order.customer_details?.customer_id);
            if (customer) {
                const existingInvoice = await Invoice.findOne({ orderId: order._id });
                invoice = existingInvoice || await InvoiceService.createInvoice(order, customer as any);
            }

            await EmailService.addToQueue(
                EmailType.SHIPPING_CONFIRMATION,
                customerEmail,
                order._id,
                {
                    orderId: order.order_id,
                    customerName,
                    courierName: order.shipping_details?.courier_name || "Shipping Partner",
                    trackingNumber: order.shipping_details?.tracking_number || "TBD",
                    trackingUrl: order.shipping_details?.tracking_url || "",
                    invoiceNumber: invoice?.invoiceNumber,
                    invoicePdfPath: invoice?.pdfPath,
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

        const invoice = await Invoice.findOne({ orderId: order._id }).select("invoiceNumber invoiceDate totalAmount status pdfPath");

        res.json({
            success: true,
            data: {
                ...order.toObject(),
                invoice,
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
        const validStatuses = ['created', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
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

        if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
            return res.status(404).json({ message: "Invoice PDF not found" });
        }

        res.download(invoice.pdfPath, `Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
        console.error("Download Order Invoice Error:", error);
        res.status(500).json({ message: "Failed to download invoice" });
    }
};
