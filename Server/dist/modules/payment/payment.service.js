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
exports.processWebhookEvent = exports.verifyWebhookSignature = exports.createPaymentOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const env_config_1 = require("../../config/env.config");
const payment_model_1 = require("../../models/payment.model");
const order_model_1 = require("../../models/order.model");
const customer_model_1 = require("../../models/customer.model");
const inventory_service_1 = require("../inventory/inventory.service");
const invoice_service_1 = require("../../services/invoice.service");
const email_service_1 = require("../../services/email.service");
const getRazorpayClient = () => {
    if (!env_config_1.env.ENABLE_ONLINE_PAYMENTS) {
        throw new Error("Online payments are disabled");
    }
    if (!env_config_1.env.RAZORPAY_KEY_ID || !env_config_1.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay credentials are not configured");
    }
    return new razorpay_1.default({
        key_id: env_config_1.env.RAZORPAY_KEY_ID,
        key_secret: env_config_1.env.RAZORPAY_KEY_SECRET,
    });
};
const createPaymentOrder = (amount_1, ...args_1) => __awaiter(void 0, [amount_1, ...args_1], void 0, function* (amount, currency = "INR", receipt, notes = {}) {
    const options = {
        amount: amount, // Amount in paise
        currency,
        receipt,
        notes,
    };
    try {
        const razorpay = getRazorpayClient();
        const order = yield razorpay.orders.create(options);
        return order;
    }
    catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        throw new Error("Failed to create payment order");
    }
});
exports.createPaymentOrder = createPaymentOrder;
const verifyWebhookSignature = (body, signature) => {
    if (!env_config_1.env.ENABLE_ONLINE_PAYMENTS || !env_config_1.env.RAZORPAY_WEBHOOK_SECRET) {
        return false;
    }
    const generatedSignature = crypto_1.default
        .createHmac("sha256", env_config_1.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");
    return generatedSignature === signature;
};
exports.verifyWebhookSignature = verifyWebhookSignature;
const orderIdGenerator_1 = require("../../utils/orderIdGenerator");
// ... existing imports
const processWebhookEvent = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { event: eventName, payload } = event;
    console.log(`Processing Webhook Event: ${eventName}`);
    // Idempotency: Check if we've already processed this payment entity
    const entity = (_a = payload.payment) === null || _a === void 0 ? void 0 : _a.entity;
    if (!entity) {
        console.warn("Webhook payload missing payment entity");
        return;
    }
    const gatewayPaymentId = entity.id;
    const gatewayOrderId = entity.order_id;
    const amount = entity.amount; // In paise
    const currency = entity.currency;
    const status = entity.status;
    const method = entity.method;
    // Check if payment record exists
    let payment = yield payment_model_1.Payment.findOne({ gateway_payment_id: gatewayPaymentId });
    if (payment && payment.status === "captured") {
        console.log(`Payment ${gatewayPaymentId} already captured. Skipping.`);
        // Even if payment is captured, we should ensure Order exists (in case order creation failed last time but payment update succeeded? Unlikely if transaction, but good for robustness)
        // But for strict idempotency, if payment is 'captured', we assume we handled it.
        return;
    }
    if (!payment) {
        // Create payment record if it doesn't exist
        payment = new payment_model_1.Payment({
            gateway_payment_id: gatewayPaymentId,
            gateway_order_id: gatewayOrderId,
            amount,
            currency,
            status,
            method,
            payment_method: "razorpay",
            gateway_response: payload,
        });
        yield payment.save();
    }
    else {
        // Update existing payment
        payment.status = status;
        payment.gateway_response = payload;
        yield payment.save();
    }
    // Handle specific events
    switch (eventName) {
        case "payment.captured":
            yield handlePaymentCaptured(payment, gatewayOrderId, entity);
            break;
        case "payment.failed":
            yield handlePaymentFailed(payment, entity);
            break;
        default:
            console.log(`Unhandled event type: ${eventName}`);
    }
});
exports.processWebhookEvent = processWebhookEvent;
const handlePaymentCaptured = (payment, gatewayOrderId, entity) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Double check Order existence
    const existingOrder = yield order_model_1.Order.findOne({ payment_id: payment._id });
    if (existingOrder) {
        console.log("Order already created for this payment.");
        return;
    }
    // 2. Parse Notes for Customer & Items
    const notes = entity.notes || {};
    // Safety check: if no notes, we can't create a proper order. 
    // We should log error or create a "Skeleton" order for manual review.
    // For now, let's try to parse.
    let items = [];
    let customerDetails = {
        name: "Unknown",
        email: entity.email || "",
        phone: entity.contact || "",
        customer_id: notes.customer_id // If provided
    };
    let shippingAddress = {
        line1: "Not provided",
        city: "Not provided",
        state: "Not provided",
        pincode: "000000",
        country: "India"
    };
    try {
        if (notes.items) {
            items = JSON.parse(notes.items);
        }
        if (notes.shipping_address) {
            const address = JSON.parse(notes.shipping_address);
            shippingAddress = Object.assign(Object.assign({}, shippingAddress), address);
        }
        if (notes.customer_name)
            customerDetails.name = notes.customer_name;
        if (notes.customer_email)
            customerDetails.email = notes.customer_email;
        if (notes.customer_phone)
            customerDetails.phone = notes.customer_phone;
    }
    catch (e) {
        console.error("Failed to parse notes data:", e);
    }
    // if items are empty, we might have a problem.
    if (items.length === 0) {
        console.error("No items found in payment notes. Creating empty order for review.");
    }
    // 3. Create Customer Record
    let customerDoc;
    try {
        const address = notes.shipping_address ? JSON.parse(notes.shipping_address) : {};
        const customerData = {
            full_name: notes.customer_name || "Unknown Customer",
            email: notes.customer_email || entity.email || "unknown@example.com",
            phone: notes.customer_phone || entity.contact || "0000000000",
            address_line1: address.line1 || "Not provided",
            address_line2: address.line2 || "",
            city: address.city || "Not provided",
            state: address.state || "Maharashtra", // Default or fallback
            pincode: address.pincode || "000000",
            // valid phone adjustment if needed for testing (e.g. if 'contact' comes with +91)
        };
        // Clean phone if it comes with +91
        if (customerData.phone.startsWith("+91")) {
            customerData.phone = customerData.phone.slice(3);
        }
        customerDoc = yield customer_model_1.Customer.create(customerData);
        console.log(`Customer record created: ${customerDoc._id}`);
    }
    catch (error) {
        console.error("Failed to create customer record:", error);
        // We shouldn't stop order creation if customer creation fails (e.g. validation error)
        // But Order model requires customer_id. 
        // We will create a placeholder customer only if strict validation fails? 
        // For now, let's re-throw so we can debug, or create a 'fallback' customer.
        // Actually, if we fail here, we should probably fail the webhook so it retries, 
        // OR fix the data. 
        // Let's log and proceed processing, assuming we can fix it manually? 
        // No, Order creation will fail without ID.
        // Let's try to create a 'fallback' strict valid customer for 'Unknowns'
        // Ideally this should be handled better.
        throw error; // Fail for now to see issues in development
    }
    // 4. Generate Order ID
    const orderId = yield (0, orderIdGenerator_1.generateOrderId)();
    // 5. Create Order
    const newOrder = new order_model_1.Order({
        order_id: orderId,
        customer_details: {
            name: customerDoc.full_name,
            email: customerDoc.email,
            phone: customerDoc.phone,
            customer_id: customerDoc._id,
        },
        items: items,
        total_amount: payment.amount,
        items_count: items.reduce((acc, item) => acc + (item.quantity || 0), 0),
        status: "paid", // It's captured on payment.captured
        payment_method: "razorpay",
        payment_status: "captured",
        payment_id: payment._id,
        shipping_address: shippingAddress,
        shipping_details: {},
        history: [{
                status: "created",
                changed_by: "system",
                reason: "Payment verified"
            }, {
                status: "paid",
                changed_by: "system",
                reason: "Payment captured"
            }]
    });
    yield newOrder.save();
    // 5. Link Order to Payment
    payment.order_id = newOrder._id;
    payment.status = "captured";
    payment.processed_at = new Date();
    yield payment.save();
    // Link Customer to Order
    if (customerDoc) {
        customerDoc.order_id = newOrder._id;
        yield customerDoc.save();
    }
    // 6. Decrement Inventory
    // We do this concurrently or carefully.
    try {
        const inventoryResults = yield Promise.all(items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            if (!item.sku)
                return { sku: "unknown", success: true }; // Skip if no SKU
            const success = yield (0, inventory_service_1.reserveStock)(item.sku, item.quantity, newOrder._id);
            return { sku: item.sku, success };
        })));
        const failedItems = inventoryResults.filter(r => !r.success);
        if (failedItems.length > 0) {
            console.error(`CRITICAL: Stock reservation failed for SKUs: ${failedItems.map(i => i.sku).join(", ")}. Order ${orderId} created but stock logic failed.`);
            // Trigger alerts here
        }
    }
    catch (invError) {
        console.error("Inventory update error:", invError);
    }
    console.log(`Order ${newOrder.order_id} created successfully.`);
    // 7. Generate Invoice
    try {
        console.log(`Generating invoice for Order ${newOrder.order_id}...`);
        const invoice = yield invoice_service_1.InvoiceService.createInvoice(newOrder, customerDoc);
        // 8. Send Email
        // 8. Queue Emails
        // Order Confirmation
        yield email_service_1.EmailService.addToQueue("order_confirmation", // Using string or import enum if possible, keeping string to avoid import circular dependency issues if any, or just import
        customerDoc.email, newOrder._id, {
            orderId: newOrder.order_id,
            customerName: customerDoc.full_name,
            total: newOrder.total_amount / 100, // Convert to rupees
        });
        // Invoice Email
        yield email_service_1.EmailService.addToQueue("invoice", customerDoc.email, newOrder._id, {
            orderId: newOrder.order_id,
            customerName: customerDoc.full_name,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.totalAmount,
            pdfPath: invoice.pdfPath,
        });
        // Update status to emailed
        invoice.status = 'emailed';
        yield invoice.save();
    }
    catch (invoiceError) {
        console.error("CRITICAL: Invoice generation failed for Order", newOrder.order_id, invoiceError);
        // Do not rollback order, but alert admin
    }
});
const handlePaymentFailed = (payment, entity) => __awaiter(void 0, void 0, void 0, function* () {
    payment.status = "failed";
    payment.error_reason = entity.error_description || "Unknown error";
    yield payment.save();
    console.log(`Payment ${payment.gateway_payment_id} failed.`);
});
