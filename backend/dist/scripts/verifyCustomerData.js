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
const mongoose_1 = __importDefault(require("mongoose"));
const payment_service_1 = require("../modules/payment/payment.service");
const order_model_1 = require("../models/order.model");
const customer_model_1 = require("../models/customer.model");
const payment_model_1 = require("../models/payment.model");
const env_config_1 = require("../config/env.config");
const crypto_1 = __importDefault(require("crypto"));
// Mock data
const mockPaymentId = "pay_" + crypto_1.default.randomBytes(4).toString("hex");
const mockOrderId = "order_" + crypto_1.default.randomBytes(4).toString("hex");
const mockEmail = `test_${Date.now()}@example.com`;
const mockPhone = "9988776655";
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
                        sku: "SKU123",
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
const verifyCustomerData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to DB
        yield mongoose_1.default.connect(env_config_1.env.MONGO_URI);
        console.log("Connected to MongoDB");
        // Clear any existing test data if needed (optional, using random IDs so unlikely to clash)
        // Call processWebhookEvent
        console.log("Simulating 'payment.captured' webhook...");
        yield (0, payment_service_1.processWebhookEvent)({
            event: "payment.captured",
            payload: mockPayload
        });
        // Verification
        console.log("Verifying data...");
        // 1. Check Customer
        const customer = yield customer_model_1.Customer.findOne({ email: mockEmail });
        if (!customer)
            throw new Error("Customer record not found!");
        console.log("✅ Customer record found:", customer._id);
        if (customer.full_name !== "Test Customer")
            throw new Error("Customer name mismatch");
        if (customer.phone !== mockPhone)
            throw new Error(`Customer phone mismatch: ${customer.phone}`);
        if (customer.pincode !== "400001")
            throw new Error("Customer pincode mismatch");
        // 2. Check Order
        const order = yield order_model_1.Order.findOne({ "customer_details.email": mockEmail });
        if (!order)
            throw new Error("Order record not found!");
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
    }
    catch (error) {
        console.error("❌ Verification Failed:", error);
    }
    finally {
        // Cleanup
        if (mongoose_1.default.connection.readyState !== 0) {
            // Optional: Delete test data
            yield payment_model_1.Payment.deleteOne({ gateway_payment_id: mockPaymentId });
            yield customer_model_1.Customer.deleteOne({ email: mockEmail });
            yield order_model_1.Order.deleteOne({ "customer_details.email": mockEmail });
            yield mongoose_1.default.disconnect();
        }
    }
});
verifyCustomerData();
