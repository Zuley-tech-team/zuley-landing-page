import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../../config/env.config";
import { Payment } from "../../models/payment.model";
import { Order } from "../../models/order.model";
import { Inventory } from "../../models/inventory.model";
import { Customer } from "../../models/customer.model";
import { reserveStock } from "../inventory/inventory.service";
import { InvoiceService } from "../../services/invoice.service";
import { EmailService } from "../../services/email.service";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createPaymentOrder = async (
    amount: number,
    currency: string = "INR",
    receipt: string,
    notes: Record<string, string> = {}
) => {
    const options = {
        amount: amount, // Amount in paise
        currency,
        receipt,
        notes,
    };

    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        throw new Error("Failed to create payment order");
    }
};

export const verifyWebhookSignature = (
    body: string,
    signature: string
): boolean => {
    const generatedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

    return generatedSignature === signature;
};

import { generateOrderId } from "../../utils/orderIdGenerator";

// ... existing imports

export const processWebhookEvent = async (event: any) => {
    const { event: eventName, payload } = event;

    console.log(`Processing Webhook Event: ${eventName}`);

    // Idempotency: Check if we've already processed this payment entity
    const entity = payload.payment?.entity;

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
    let payment = await Payment.findOne({ gateway_payment_id: gatewayPaymentId });

    if (payment && payment.status === "captured") {
        console.log(`Payment ${gatewayPaymentId} already captured. Skipping.`);
        // Even if payment is captured, we should ensure Order exists (in case order creation failed last time but payment update succeeded? Unlikely if transaction, but good for robustness)
        // But for strict idempotency, if payment is 'captured', we assume we handled it.
        return;
    }

    if (!payment) {
        // Create payment record if it doesn't exist
        payment = new Payment({
            gateway_payment_id: gatewayPaymentId,
            gateway_order_id: gatewayOrderId,
            amount,
            currency,
            status,
            method,
            gateway_response: payload,
        });
        await payment.save();
    } else {
        // Update existing payment
        payment.status = status;
        payment.gateway_response = payload;
        await payment.save();
    }

    // Handle specific events
    switch (eventName) {
        case "payment.captured":
            await handlePaymentCaptured(payment, gatewayOrderId, entity);
            break;
        case "payment.failed":
            await handlePaymentFailed(payment, entity);
            break;
        default:
            console.log(`Unhandled event type: ${eventName}`);
    }
};

const handlePaymentCaptured = async (payment: any, gatewayOrderId: string, entity: any) => {
    // 1. Double check Order existence
    const existingOrder = await Order.findOne({ payment_id: payment._id });
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
            shippingAddress = { ...shippingAddress, ...address };
        }
        if (notes.customer_name) customerDetails.name = notes.customer_name;
        if (notes.customer_email) customerDetails.email = notes.customer_email;
        if (notes.customer_phone) customerDetails.phone = notes.customer_phone;

    } catch (e) {
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

        customerDoc = await Customer.create(customerData);
        console.log(`Customer record created: ${customerDoc._id}`);

    } catch (error) {
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
    const orderId = await generateOrderId();

    // 5. Create Order
    const newOrder = new Order({
        order_id: orderId,
        customer_details: {
            name: customerDoc.full_name,
            email: customerDoc.email,
            phone: customerDoc.phone,
            customer_id: customerDoc._id,
        },
        items: items,
        total_amount: payment.amount,
        items_count: items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0),
        status: "paid", // It's captured on payment.captured
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

    await newOrder.save();

    // 5. Link Order to Payment
    payment.order_id = newOrder._id;
    payment.status = "captured";
    payment.processed_at = new Date();
    await payment.save();

    // Link Customer to Order
    if (customerDoc) {
        customerDoc.order_id = newOrder._id;
        await customerDoc.save();
    }

    // 6. Decrement Inventory
    // We do this concurrently or carefully.
    try {
        const inventoryResults = await Promise.all(items.map(async (item: any) => {
            if (!item.sku) return { sku: "unknown", success: true }; // Skip if no SKU

            const success = await reserveStock(item.sku, item.quantity, newOrder._id);
            return { sku: item.sku, success };
        }));

        const failedItems = inventoryResults.filter(r => !r.success);
        if (failedItems.length > 0) {
            console.error(`CRITICAL: Stock reservation failed for SKUs: ${failedItems.map(i => i.sku).join(", ")}. Order ${orderId} created but stock logic failed.`);
            // Trigger alerts here
        }

    } catch (invError) {
        console.error("Inventory update error:", invError);
    }

    console.log(`Order ${newOrder.order_id} created successfully.`);

    // 7. Generate Invoice
    try {
        console.log(`Generating invoice for Order ${newOrder.order_id}...`);
        const invoice = await InvoiceService.createInvoice(newOrder, customerDoc);

        // 8. Send Email
        // 8. Queue Emails
        // Order Confirmation
        await EmailService.addToQueue(
            "order_confirmation" as any, // Using string or import enum if possible, keeping string to avoid import circular dependency issues if any, or just import
            customerDoc.email,
            newOrder._id,
            {
                orderId: newOrder.order_id,
                customerName: customerDoc.full_name,
                total: newOrder.total_amount / 100, // Convert to rupees
            }
        );

        // Invoice Email
        await EmailService.addToQueue(
            "invoice" as any,
            customerDoc.email,
            newOrder._id,
            {
                orderId: newOrder.order_id,
                customerName: customerDoc.full_name,
                invoiceNumber: invoice.invoiceNumber,
                amount: newOrder.total_amount / 100,
                pdfPath: invoice.pdfPath,
            }
        );

        // Update status to emailed
        invoice.status = 'emailed';
        await invoice.save();

    } catch (invoiceError) {
        console.error("CRITICAL: Invoice generation failed for Order", newOrder.order_id, invoiceError);
        // Do not rollback order, but alert admin
    }
};

const handlePaymentFailed = async (payment: any, entity: any) => {
    payment.status = "failed";
    payment.error_reason = entity.error_description || "Unknown error";
    await payment.save();
    console.log(`Payment ${payment.gateway_payment_id} failed.`);
};
