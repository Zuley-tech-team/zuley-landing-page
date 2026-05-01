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
exports.downloadOrderInvoice = exports.getOrderInvoice = exports.markReturnReplaced = exports.markReturnRefunded = exports.rejectReturnRequest = exports.acceptReturnRequest = exports.markCodPaymentCollected = exports.confirmOrder = exports.updateOrderStatus = exports.getOrderById = exports.getOrders = void 0;
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
    var _a, _b, _c, _d, _e;
    if (oldStatus === newStatus) {
        return;
    }
    const customerEmail = (_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.email;
    const customerName = ((_b = order.customer_details) === null || _b === void 0 ? void 0 : _b.name) || "Customer";
    if (newStatus === "confirmed") {
        order.payment_status = order.payment_method === "cod" ? order.payment_status : "captured";
        yield order.save();
        if (order.payment_id && order.payment_method !== "cod") {
            yield payment_model_1.Payment.findByIdAndUpdate(order.payment_id, {
                status: "captured",
            });
        }
        if (customerEmail) {
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.ORDER_CONFIRMATION, customerEmail, order._id, {
                orderId: order.order_id,
                customerName,
                total: order.total_amount / 100,
            });
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
        if (customerEmail) {
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.SHIPPING_CONFIRMATION, customerEmail, order._id, {
                orderId: order.order_id,
                customerName,
                courierName: ((_c = order.shipping_details) === null || _c === void 0 ? void 0 : _c.courier_name) || "Our Shipping Partner",
                trackingNumber: ((_d = order.shipping_details) === null || _d === void 0 ? void 0 : _d.tracking_number) || "Will be shared shortly",
                trackingUrl: ((_e = order.shipping_details) === null || _e === void 0 ? void 0 : _e.tracking_url) || "",
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
    if (newStatus === "cancelled" && customerEmail) {
        yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.REFUND_CONFIRMATION, customerEmail, order._id, {
            subjectPrefix: "Order Cancelled",
            orderId: order.order_id,
            customerName,
            message: `Your order ${order.order_id} has been cancelled as per our review. If this was unexpected, please contact support.`,
        });
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
        const skip = (Number(page) - 1) * Number(limit);
        const orders = yield order_model_1.Order.aggregate([
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
        const replacementOrders = yield order_model_1.Order.find({ replacement_of: order._id }).sort({ createdAt: -1 }).lean();
        const replacementOriginal = order.replacement_of
            ? yield order_model_1.Order.findById(order.replacement_of).lean()
            : null;
        res.json({
            success: true,
            data: Object.assign(Object.assign({}, order.toObject()), { invoice, replacement_orders: replacementOrders, replacement_original: replacementOriginal }),
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
const confirmOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { note } = req.body || {};
        const order = yield order_model_1.Order.findOne({ order_id: id });
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
        yield order.save();
        if ((_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.email) {
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.ORDER_CONFIRMATION, order.customer_details.email, order._id, {
                orderId: order.order_id,
                customerName: ((_b = order.customer_details) === null || _b === void 0 ? void 0 : _b.name) || "Customer",
                total: order.total_amount / 100,
            });
        }
        yield admin_logger_service_1.AdminLogger.logAction(req.admin._id, "CONFIRM_ORDER", "order", order.order_id, { oldStatus: previousStatus, newStatus: "confirmed", note: note || "Order confirmed by admin" }, req);
        res.json({
            success: true,
            data: order,
            message: "Order confirmed successfully",
        });
    }
    catch (error) {
        console.error("Confirm Order Error:", error);
        res.status(500).json({ message: "Failed to confirm order" });
    }
});
exports.confirmOrder = confirmOrder;
const markCodPaymentCollected = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { note } = req.body || {};
        const order = yield order_model_1.Order.findOne({ order_id: id });
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
        yield order.save();
        if (order.payment_id) {
            yield payment_model_1.Payment.findByIdAndUpdate(order.payment_id, {
                status: "cod_collected",
                collected_at: new Date(),
            });
        }
        if ((_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.email) {
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.REFUND_CONFIRMATION, order.customer_details.email, order._id, {
                subjectPrefix: "Payment Received",
                orderId: order.order_id,
                customerName: ((_b = order.customer_details) === null || _b === void 0 ? void 0 : _b.name) || "Customer",
                message: `We have received your Cash on Delivery payment for order ${order.order_id}. Thank you.`,
            });
        }
        yield admin_logger_service_1.AdminLogger.logAction(req.admin._id, "MARK_COD_PAID", "order", order.order_id, { note: note || "COD payment collected by admin" }, req);
        res.json({
            success: true,
            data: order,
            message: "COD payment marked as collected",
        });
    }
    catch (error) {
        console.error("Mark COD Paid Error:", error);
        res.status(500).json({ message: "Failed to mark COD payment as collected" });
    }
});
exports.markCodPaymentCollected = markCodPaymentCollected;
const acceptReturnRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { note } = req.body || {};
        const order = yield order_model_1.Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "return_requested") {
            return res.status(400).json({ message: "Return request is not pending for this order." });
        }
        order.status = "return_in_progress";
        if (!order.return_request) {
            order.return_request = {};
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
        yield order.save();
        if ((_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.email) {
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.RETURN_ACCEPTED, order.customer_details.email, order._id, {
                orderId: order.order_id,
                customerName: ((_b = order.customer_details) === null || _b === void 0 ? void 0 : _b.name) || "Customer",
                type: ((_c = order.return_request) === null || _c === void 0 ? void 0 : _c.type) || "refund",
            });
        }
        return res.json({ success: true, data: order });
    }
    catch (error) {
        console.error("Accept Return Request Error:", error);
        return res.status(500).json({ message: "Failed to accept return request" });
    }
});
exports.acceptReturnRequest = acceptReturnRequest;
const rejectReturnRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { note } = req.body || {};
        const order = yield order_model_1.Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "return_requested") {
            return res.status(400).json({ message: "Return request is not pending for this order." });
        }
        order.status = "return_rejected";
        if (!order.return_request) {
            order.return_request = {};
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
        yield order.save();
        if ((_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.email) {
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.RETURN_REJECTED, order.customer_details.email, order._id, {
                orderId: order.order_id,
                customerName: ((_b = order.customer_details) === null || _b === void 0 ? void 0 : _b.name) || "Customer",
                note: note || "Return request rejected",
            });
        }
        return res.json({ success: true, data: order });
    }
    catch (error) {
        console.error("Reject Return Request Error:", error);
        return res.status(500).json({ message: "Failed to reject return request" });
    }
});
exports.rejectReturnRequest = rejectReturnRequest;
const markReturnRefunded = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { note } = req.body || {};
        const order = yield order_model_1.Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "return_in_progress") {
            return res.status(400).json({ message: "Return is not in progress for this order." });
        }
        order.status = "refunded";
        order.payment_status = "refunded";
        if (!order.return_request) {
            order.return_request = {};
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
        yield order.save();
        if (order.payment_id) {
            yield payment_model_1.Payment.findByIdAndUpdate(order.payment_id, {
                status: "refunded",
            });
        }
        if ((_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.email) {
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.RETURN_REFUNDED, order.customer_details.email, order._id, {
                orderId: order.order_id,
                customerName: ((_b = order.customer_details) === null || _b === void 0 ? void 0 : _b.name) || "Customer",
                note: note || "Return refunded",
            });
        }
        return res.json({ success: true, data: order });
    }
    catch (error) {
        console.error("Mark Return Refunded Error:", error);
        return res.status(500).json({ message: "Failed to mark return as refunded" });
    }
});
exports.markReturnRefunded = markReturnRefunded;
const markReturnReplaced = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { note } = req.body || {};
        const order = yield order_model_1.Order.findOne({ order_id: id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "return_in_progress") {
            return res.status(400).json({ message: "Return is not in progress for this order." });
        }
        if (((_a = order.return_request) === null || _a === void 0 ? void 0 : _a.type) && order.return_request.type !== "replace") {
            return res.status(400).json({ message: "Return request is not marked for replacement." });
        }
        order.status = "replaced";
        if (!order.return_request) {
            order.return_request = {};
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
        yield order.save();
        if ((_b = order.customer_details) === null || _b === void 0 ? void 0 : _b.email) {
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.RETURN_REPLACED, order.customer_details.email, order._id, {
                orderId: order.order_id,
                customerName: ((_c = order.customer_details) === null || _c === void 0 ? void 0 : _c.name) || "Customer",
                note: note || "Replacement in progress",
            });
        }
        return res.json({ success: true, data: order });
    }
    catch (error) {
        console.error("Mark Return Replaced Error:", error);
        return res.status(500).json({ message: "Failed to mark return as replaced" });
    }
});
exports.markReturnReplaced = markReturnReplaced;
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
