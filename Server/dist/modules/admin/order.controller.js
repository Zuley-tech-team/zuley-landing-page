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
exports.downloadOrderInvoice = exports.getOrderInvoice = exports.updateOrderStatus = exports.getOrderById = exports.getOrders = void 0;
const order_model_1 = require("../../models/order.model");
const admin_logger_service_1 = require("../../services/admin-logger.service");
const customer_model_1 = require("../../models/customer.model");
const invoice_model_1 = require("../../models/invoice.model");
const invoice_service_1 = require("../../services/invoice.service");
const email_service_1 = require("../../services/email.service");
const email_queue_model_1 = require("../../models/email-queue.model");
const inventory_service_1 = require("../inventory/inventory.service");
const payment_model_1 = require("../../models/payment.model");
const fs_1 = __importDefault(require("fs"));
const TERMINAL_STATUSES = new Set(["cancelled", "refunded"]);
const triggerOrderStatusSideEffects = (order, oldStatus, newStatus, note) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    if (oldStatus === newStatus) {
        return;
    }
    const customerEmail = (_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.email;
    const customerName = ((_b = order.customer_details) === null || _b === void 0 ? void 0 : _b.name) || "Customer";
    if (newStatus === "paid") {
        order.payment_status = order.payment_method === "cod" ? "cod_collected" : "captured";
        yield order.save();
        if (order.payment_id) {
            yield payment_model_1.Payment.findByIdAndUpdate(order.payment_id, {
                status: order.payment_method === "cod" ? "cod_collected" : "captured",
                collected_at: order.payment_method === "cod" ? new Date() : undefined,
            });
        }
        const customer = yield customer_model_1.Customer.findById((_c = order.customer_details) === null || _c === void 0 ? void 0 : _c.customer_id);
        if (!customer) {
            console.warn(`[OrderStatus] Customer not found for order ${order.order_id}; skipping invoice generation.`);
        }
        else {
            const existingInvoice = yield invoice_model_1.Invoice.findOne({ orderId: order._id });
            const invoice = existingInvoice || (yield invoice_service_1.InvoiceService.createInvoice(order, customer));
            if (customerEmail) {
                yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.ORDER_CONFIRMATION, customerEmail, order._id, {
                    orderId: order.order_id,
                    customerName,
                    total: order.total_amount / 100,
                });
                yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.INVOICE, customerEmail, order._id, {
                    orderId: order.order_id,
                    customerName,
                    invoiceNumber: invoice.invoiceNumber,
                    amount: invoice.totalAmount,
                    pdfPath: invoice.pdfPath,
                });
                invoice.status = "emailed";
                yield invoice.save();
            }
        }
    }
    if (newStatus === "shipped") {
        if (!order.shipping_details) {
            order.shipping_details = {};
        }
        if (!order.shipping_details.shipped_at) {
            order.shipping_details.shipped_at = new Date();
            yield order.save();
        }
        let invoice = null;
        if (customerEmail) {
            const customer = yield customer_model_1.Customer.findById((_d = order.customer_details) === null || _d === void 0 ? void 0 : _d.customer_id);
            if (customer) {
                const existingInvoice = yield invoice_model_1.Invoice.findOne({ orderId: order._id });
                invoice = existingInvoice || (yield invoice_service_1.InvoiceService.createInvoice(order, customer));
            }
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.SHIPPING_CONFIRMATION, customerEmail, order._id, {
                orderId: order.order_id,
                customerName,
                courierName: ((_e = order.shipping_details) === null || _e === void 0 ? void 0 : _e.courier_name) || "Shipping Partner",
                trackingNumber: ((_f = order.shipping_details) === null || _f === void 0 ? void 0 : _f.tracking_number) || "TBD",
                trackingUrl: ((_g = order.shipping_details) === null || _g === void 0 ? void 0 : _g.tracking_url) || "",
                invoiceNumber: invoice === null || invoice === void 0 ? void 0 : invoice.invoiceNumber,
                invoicePdfPath: invoice === null || invoice === void 0 ? void 0 : invoice.pdfPath,
            });
        }
    }
    if (newStatus === "delivered") {
        if (order.payment_method === "cod" && order.payment_status !== "cod_collected") {
            order.payment_status = "cod_collected";
            yield payment_model_1.Payment.findByIdAndUpdate(order.payment_id, {
                status: "cod_collected",
                collected_at: new Date(),
            });
        }
        if (!order.shipping_details) {
            order.shipping_details = {};
        }
        if (!order.shipping_details.delivered_at) {
            order.shipping_details.delivered_at = new Date();
            yield order.save();
        }
        if (customerEmail) {
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.DELIVERY_CONFIRMATION, customerEmail, order._id, {
                orderId: order.order_id,
                customerName,
            });
        }
    }
    if (TERMINAL_STATUSES.has(newStatus) && !TERMINAL_STATUSES.has(oldStatus)) {
        for (const item of order.items || []) {
            if (!(item === null || item === void 0 ? void 0 : item.sku) || !(item === null || item === void 0 ? void 0 : item.quantity)) {
                continue;
            }
            try {
                yield (0, inventory_service_1.restoreStock)(item.sku, item.quantity, newStatus === "refunded" ? "refund" : "cancellation", order._id);
            }
            catch (stockError) {
                console.error(`[OrderStatus] Failed to restore stock for ${order.order_id} (${item.sku}):`, stockError);
            }
        }
    }
    if (note) {
        console.log(`[OrderStatus] ${order.order_id} side effects processed with note: ${note}`);
    }
});
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const query = {};
        // Filter by status
        if (status && status !== 'All') {
            query.status = status;
        }
        // Search logic (Order ID, Customer Name/Email/Phone)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { order_id: searchRegex },
                { "customer_details.name": searchRegex },
                { "customer_details.email": searchRegex },
                { "customer_details.phone": searchRegex },
            ];
        }
        const orders = yield order_model_1.Order.find(query)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield order_model_1.Order.countDocuments(query);
        res.json({
            success: true,
            data: orders,
            pagination: {
                current: Number(page),
                total: Math.ceil(total / Number(limit)),
                count: total,
            }
        });
    }
    catch (error) {
        console.error("Get Orders Error:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});
exports.getOrders = getOrders;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const order = yield order_model_1.Order.findOne({ order_id: id }).populate('payment_id');
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const invoice = yield invoice_model_1.Invoice.findOne({ orderId: order._id }).select("invoiceNumber invoiceDate totalAmount status pdfPath");
        res.json({
            success: true,
            data: Object.assign(Object.assign({}, order.toObject()), { invoice }),
        });
    }
    catch (error) {
        console.error("Get Order Detail Error:", error);
        res.status(500).json({ message: "Failed to fetch order details" });
    }
});
exports.getOrderById = getOrderById;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        // Validate Status transition (simplified for now)
        const validStatuses = ['created', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const order = yield order_model_1.Order.findOne({ order_id: id });
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
        yield order.save();
        // Log Admin Action
        yield admin_logger_service_1.AdminLogger.logAction(req.admin._id, "UPDATE_STATUS", "order", order.order_id, { oldStatus, newStatus: status, note }, req);
        try {
            yield triggerOrderStatusSideEffects(order, oldStatus, status, note);
        }
        catch (sideEffectError) {
            console.error("Order status side effect error:", sideEffectError);
        }
        res.json({ success: true, data: order });
    }
    catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
});
exports.updateOrderStatus = updateOrderStatus;
const getOrderInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const order = yield order_model_1.Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        let invoice = yield invoice_model_1.Invoice.findOne({ orderId: order._id });
        if (!invoice) {
            const customer = yield customer_model_1.Customer.findById((_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.customer_id);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found for invoice generation" });
            }
            invoice = yield invoice_service_1.InvoiceService.createInvoice(order, customer);
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
    }
    catch (error) {
        console.error("Get Order Invoice Error:", error);
        res.status(500).json({ message: "Failed to fetch invoice" });
    }
});
exports.getOrderInvoice = getOrderInvoice;
const downloadOrderInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const order = yield order_model_1.Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        let invoice = yield invoice_model_1.Invoice.findOne({ orderId: order._id });
        if (!invoice) {
            const customer = yield customer_model_1.Customer.findById((_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.customer_id);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found for invoice generation" });
            }
            invoice = yield invoice_service_1.InvoiceService.createInvoice(order, customer);
        }
        if (!invoice.pdfPath || !fs_1.default.existsSync(invoice.pdfPath)) {
            return res.status(404).json({ message: "Invoice PDF not found" });
        }
        res.download(invoice.pdfPath, `Invoice-${invoice.invoiceNumber}.pdf`);
    }
    catch (error) {
        console.error("Download Order Invoice Error:", error);
        res.status(500).json({ message: "Failed to download invoice" });
    }
});
exports.downloadOrderInvoice = downloadOrderInvoice;
