import mongoose from "mongoose";
import { processWebhookEvent } from "../modules/payment/payment.service";
import { Order } from "../models/order.model";
import { Customer } from "../models/customer.model";
import { Payment } from "../models/payment.model";
import { Inventory } from "../models/inventory.model";
import { env } from "../config/env.config";
import crypto from "crypto";

// Mock data
const mockPaymentId = "pay_" + crypto.randomBytes(4).toString("hex");
const mockOrderId = "order_" + crypto.randomBytes(4).toString("hex");
const mockEmail = `test_${Date.now()}@example.com`;
const mockPhone = "9988776655";
const testSku = "VERIFY-CUSTOMER-SKU";

const mockPayload = {
    payment: {
        entity: {
            id: mockPaymentId,
            order_id: mockOrderId,
            amount: 10000, // 100 INR
            currency: "INR",
            status: "captured",
            method: "card",
            email: mockEmail,
            contact: "+91" + mockPhone, // Test with +91
            notes: {
                customer_name: "Test Customer",
                customer_email: mockEmail,
                customer_phone: mockPhone,
                shipping_address: JSON.stringify({
                    line1: "123 Test Street",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001"
                }),
                items: JSON.stringify([
                    {
                        sku: testSku,
                        name: "Test Product",
                        quantity: 1,
                        price: 10000,
                        total_price: 10000
                    }
                ])
            }
        }
    }
};

const verifyCustomerData = async () => {
    try {
        // Connect to DB
        await mongoose.connect(env.MONGO_URI as string);
        console.log("Connected to MongoDB");

        // Clear any existing test data if needed (optional, using random IDs so unlikely to clash)
        await Inventory.updateOne(
            { sku: testSku },
            { $set: { quantity: 5, reserved: 0, low_stock_threshold: 1 } },
            { upsert: true }
        );

        // Call processWebhookEvent (Commented out as it uses old Razorpay signature)
        console.log("Simulating 'payment.captured' webhook...");
        // await processWebhookEvent({
        //     event: "payment.captured",
        //     payload: mockPayload
        // } as any);

        // Verification
        console.log("Verifying data...");

        // 1. Check Customer
        const customer = await Customer.findOne({ email: mockEmail });
        if (!customer) throw new Error("Customer record not found!");
        console.log("✅ Customer record found:", customer._id);

        if (customer.full_name !== "Test Customer") throw new Error("Customer name mismatch");
        if (customer.phone !== mockPhone) throw new Error(`Customer phone mismatch: ${customer.phone}`);
        if (customer.pincode !== "400001") throw new Error("Customer pincode mismatch");

        // 2. Check Order
        const order = await Order.findOne({ "customer_details.email": mockEmail });
        if (!order) throw new Error("Order record not found!");
        console.log("✅ Order record found:", order.order_id);

        // 3. Check Linking
        if (!order.customer_details || !order.customer_details.customer_id) {
            throw new Error("Order missing customer details or customer_id");
        }

        if (order.customer_details.customer_id.toString() !== customer._id.toString()) {
            throw new Error(`Order not linked to correct customer: ${order.customer_details.customer_id} vs ${customer._id}`);
        }
        console.log("✅ Order linked to Customer successfully.");

        if (customer.order_id && customer.order_id.toString() !== order._id.toString()) {
            throw new Error(`Customer not linked to correct order: ${customer.order_id} vs ${order._id}`);
        }
        console.log("✅ Customer linked to Order successfully.");

        console.log("ALL CHECKS PASSED 🎉");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    } finally {
        // Cleanup
        if (mongoose.connection.readyState !== 0) {
            // Optional: Delete test data
            await Payment.deleteOne({ gateway_payment_id: mockPaymentId });
            await Customer.deleteOne({ email: mockEmail });
            await Order.deleteOne({ "customer_details.email": mockEmail });
            await Inventory.deleteOne({ sku: testSku });
            await mongoose.disconnect();
        }
    }
};

verifyCustomerData();
