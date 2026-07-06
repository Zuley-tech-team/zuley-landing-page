import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from '@phonepe-pg/pg-sdk-node';
import { randomUUID } from 'crypto';
import { env } from "../../config/env.config";
import { Payment } from "../../models/payment.model";
import { Order } from "../../models/order.model";
import { Inventory } from "../../models/inventory.model";
import { Customer } from "../../models/customer.model";
import { Product } from "../../models/product.model";
import { reserveStock } from "../inventory/inventory.service";
import { InvoiceService } from "../../services/invoice.service";
import { generateOrderId } from "../../utils/orderIdGenerator";
import { EmailService } from "../../services/email.service";
import { EmailType } from "../../models/email-queue.model";

const getPhonePeClient = () => {
    if (!env.ENABLE_ONLINE_PAYMENTS) {
        throw new Error("Online payments are disabled");
    }

    if (!env.PHONEPE_CLIENT_ID || !env.PHONEPE_CLIENT_SECRET) {
        throw new Error("PhonePe credentials are not configured");
    }

    const peEnv = env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

    return StandardCheckoutClient.getInstance(
        env.PHONEPE_CLIENT_ID,
        env.PHONEPE_CLIENT_SECRET,
        Number(env.PHONEPE_CLIENT_VERSION || 1),
        peEnv
    );
};

export const createPaymentOrder = async (
    amount: number,
    currency: string = "INR",
    receipt: string,
    notes: Record<string, string> = {}
) => {
    try {
        const client = getPhonePeClient();
        const merchantOrderId = randomUUID(); // This will be gateway_order_id
        
        // We need a redirect URL back to the frontend.
        const baseUrl = env.FRONTEND_URL.includes(",") ? env.FRONTEND_URL.split(",")[0] : env.FRONTEND_URL;
        // The URL frontend will use to verify payment and show success/failure
        const frontendRedirectUrl = `${baseUrl}/order-status?id=${merchantOrderId}`;

        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(merchantOrderId)
            .amount(amount)
            .redirectUrl(frontendRedirectUrl)
            .build();

        // Save payment info + notes to DB BEFORE initiating
        const payment = new Payment({
            gateway_order_id: merchantOrderId,
            gateway_payment_id: merchantOrderId, // Temporarily use order ID to prevent null dup key
            amount: amount,
            currency: currency,
            status: "pending",
            payment_method: "phonepe",
            metadata: notes, 
        });
        await payment.save();

        const response = await client.pay(request);
        
        return {
            merchantOrderId,
            amount,
            redirectUrl: response.redirectUrl
        };
    } catch (error) {
        console.error("PhonePe Order Creation Error:", error);
        throw new Error("Failed to create payment order");
    }
};

export const syncPaymentAndCreateOrder = async (merchantOrderId: string) => {
    const client = getPhonePeClient();
    
    // Check status from PhonePe
    let statusResponse;
    try {
        statusResponse = await client.getOrderStatus(merchantOrderId);
    } catch (e) {
        console.error("Error fetching order status from PhonePe:", e);
        throw new Error("Failed to fetch payment status");
    }

    const state = statusResponse.state; // COMPLETED, FAILED, PENDING, etc
    
    let payment = await Payment.findOne({ gateway_order_id: merchantOrderId });
    if (!payment) throw new Error("Payment record not found");

    if (payment.status === "captured") {
        const order = await Order.findOne({ payment_id: payment._id });
        return { orderId: order?.order_id, invoiceNumber: null };
    }

    let mappedStatus: any = "pending";
    if (state === "COMPLETED") mappedStatus = "captured";
    else if (state === "FAILED") mappedStatus = "failed";

    payment.status = mappedStatus;
    payment.gateway_response = statusResponse;
    if (statusResponse.paymentDetails && statusResponse.paymentDetails.length > 0) {
        payment.gateway_payment_id = statusResponse.paymentDetails[0].transactionId;
        payment.method = statusResponse.paymentDetails[0].paymentMode;
    } else if (!payment.gateway_payment_id) {
        // Fallback to avoid duplicate key error if transactionId is completely missing
        payment.gateway_payment_id = merchantOrderId;
    }
    await payment.save();

    if (mappedStatus === "captured") {
        return await handlePaymentCaptured(payment, merchantOrderId, statusResponse);
    }
    
    if (mappedStatus === "failed") {
        await handlePaymentFailed(payment, statusResponse);
    }
    
    return { orderId: null, invoiceNumber: null };
};

export const processWebhookEvent = async (authorizationData: string, requestBody: string) => {
    const client = getPhonePeClient();
    
    let callbackResponse;
    try {
        callbackResponse = client.validateCallback(
            env.PHONEPE_WEBHOOK_USERNAME || "",
            env.PHONEPE_WEBHOOK_PASSWORD || "",
            authorizationData,
            requestBody
        );
    } catch (error) {
        console.error("PhonePe webhook validation failed", error);
        return false;
    }

    const merchantOrderId = callbackResponse.payload.merchantOrderId || callbackResponse.payload.orderId;
    if (!merchantOrderId) {
        console.warn("Webhook payload missing merchantOrderId");
        return true; 
    }
    
    await syncPaymentAndCreateOrder(merchantOrderId);
    return true;
};

const handlePaymentCaptured = async (payment: any, gatewayOrderId: string, entity: any) => {
    // 1. Double check Order existence
    const existingOrder = await Order.findOne({ payment_id: payment._id });
    if (existingOrder) {
        console.log("Order already created for this payment.");
        return;
    }

    // 2. Parse Notes for Customer & Items
    const notes = payment.metadata || {};

    let orderItems = [];
    let customerDetails = {
        name: "Unknown",
        email: notes.customer_email || "unknown@example.com",
        phone: notes.customer_phone || "0000000000",
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
            const parsedItems = JSON.parse(notes.items);
            for (const item of parsedItems) {
                const product = await Product.findOne({ sku: item.sku });
                if (product) {
                    orderItems.push({
                        product_id: product._id,
                        sku: product.sku,
                        name: product.name, 
                        variant_info: item.variant_info,
                        quantity: item.quantity,
                        price: Math.round(product.price * 100), 
                        total_price: Math.round(product.price * item.quantity * 100),
                        gst_rate: 3, 
                        gst_amount: 0,
                    });
                } else {
                    orderItems.push({
                        sku: item.sku,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        total_price: item.total_price,
                        gst_rate: 0,
                        gst_amount: 0,
                    });
                }
            }
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

    if (orderItems.length === 0) {
        console.error("No items found in payment notes. Creating empty order for review.");
    }

    let customerDoc;
    try {
        const customerData = {
            full_name: customerDetails.name,
            email: customerDetails.email,
            phone: customerDetails.phone,
            address_line1: shippingAddress.line1,
            address_line2: (shippingAddress as any).line2 || "",
            city: shippingAddress.city,
            state: shippingAddress.state || "Maharashtra",
            pincode: shippingAddress.pincode,
        };

        if (customerData.phone.startsWith("+91")) {
            customerData.phone = customerData.phone.slice(3);
        }

        customerDoc = await Customer.create(customerData);
        console.log(`Customer record created: ${customerDoc._id}`);

    } catch (error) {
        console.error("Failed to create customer record:", error);
        throw error;
    }

    const orderId = await generateOrderId();

    const newOrder = new Order({
        order_id: orderId,
        customer_details: {
            name: customerDoc.full_name,
            email: customerDoc.email,
            phone: customerDoc.phone,
            customer_id: customerDoc._id,
        },
        items: orderItems,
        total_amount: payment.amount,
        items_count: orderItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0),
        status: "created",
        payment_method: "phonepe",
        payment_status: "captured",
        payment_id: payment._id,
        shipping_address: shippingAddress,
        shipping_details: {},
        history: [{
            status: "created",
            changed_by: "system",
            reason: "Payment verified"
        }]
    });

    await newOrder.save();

    payment.order_id = newOrder._id;
    payment.status = "captured";
    payment.processed_at = new Date();
    await payment.save();

    if (customerDoc) {
        customerDoc.order_id = newOrder._id;
        await customerDoc.save();
    }

    try {
        const inventoryResults = await Promise.all(orderItems.map(async (item: any) => {
            if (!item.sku) return { sku: "unknown", success: true };

            const success = await reserveStock(item.sku, item.quantity, newOrder._id);
            return { sku: item.sku, success };
        }));

        const failedItems = inventoryResults.filter(r => !r.success);
        if (failedItems.length > 0) {
            console.error(`CRITICAL: Stock reservation failed for SKUs: ${failedItems.map(i => i.sku).join(", ")}. Order ${orderId} created but stock logic failed.`);
        }
    } catch (invError) {
        console.error("Inventory update error:", invError);
    }

    console.log(`Order ${newOrder.order_id} created successfully.`);

    let generatedInvoice = null;
    try {
        console.log(`Generating invoice for Order ${newOrder.order_id}...`);
        generatedInvoice = await InvoiceService.createInvoice(newOrder, customerDoc);
        await generatedInvoice.save();

        // Queue invoice email — user can log in and download from the tracking page
        await EmailService.addToQueue(
            EmailType.INVOICE,
            customerDoc.email,
            newOrder._id,
            {
                orderId: newOrder.order_id,
                invoiceNumber: generatedInvoice.invoiceNumber,
                customerName: customerDoc.full_name,
                paymentMethod: newOrder.payment_method,
                amount: newOrder.total_amount / 100,
            }
        );
    } catch (invoiceError) {
        console.error("CRITICAL: Invoice generation failed for Order", newOrder.order_id, invoiceError);
    }

    // Notify admin about the new order
    EmailService.queueAdminNewOrderNotification(newOrder);

    return { orderId: newOrder.order_id, invoiceNumber: generatedInvoice?.invoiceNumber };
};

const handlePaymentFailed = async (payment: any, entity: any) => {
    payment.status = "failed";
    payment.error_reason = entity.responseCodeDescription || "Unknown error";
    await payment.save();
    console.log(`Payment ${payment.gateway_payment_id || payment.gateway_order_id} failed.`);
};
