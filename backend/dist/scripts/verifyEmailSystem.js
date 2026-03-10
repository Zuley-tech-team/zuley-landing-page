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
const email_service_1 = require("../services/email.service");
const email_queue_model_1 = require("../models/email-queue.model");
const env_config_1 = require("../config/env.config");
function verifyEmailSystem() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(env_config_1.env.MONGO_URI);
            console.log("Connected to MongoDB");
            // Mock Data
            const mockOrder = {
                _id: new mongoose_1.default.Types.ObjectId(),
                order_id: "ZUL-TEST-001",
                customer_details: {
                    name: "Test Customer",
                    email: "manish.bulchandani@gmail.com" // You can change this to a real email for testing
                }
            };
            console.log("1. Testing addToQueue (Order Confirmation)...");
            yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.ORDER_CONFIRMATION, mockOrder.customer_details.email, mockOrder._id, {
                orderId: mockOrder.order_id,
                customerName: mockOrder.customer_details.name,
                total: 999
            });
            console.log("2. Verifying Queue Item...");
            const queuedItem = yield email_queue_model_1.EmailQueue.findOne({ order_id: mockOrder._id });
            if (!queuedItem) {
                console.error("❌ Failed: Queue item not found.");
                process.exit(1);
                return;
            }
            console.log("✅ Success: Queue item created.", queuedItem._id);
            console.log("   Status:", queuedItem.status);
            console.log("3. Processing Queue...");
            // This will try to send using Resend if API key is present
            yield email_service_1.EmailService.processQueue();
            const processedItem = yield email_queue_model_1.EmailQueue.findById(queuedItem._id);
            if (!processedItem) {
                console.error("❌ Failed: Processed item not found.");
                process.exit(1);
                return;
            }
            console.log("   Final Status:", processedItem.status);
            if (processedItem.status === 'sent') {
                console.log("✅ Email sent successfully (Mock/Real).");
            }
            else if (processedItem.status === 'failed') {
                console.log("⚠️ Email failed (Expected if no API Key). Error:", processedItem.error || "Unknown error");
            }
            console.log("Verification Complete.");
            process.exit(0);
        }
        catch (error) {
            console.error("Verification Error:", error);
            process.exit(1);
        }
    });
}
verifyEmailSystem();
