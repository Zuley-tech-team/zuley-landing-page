import mongoose from "mongoose";
import { EmailService } from "../services/email.service";
import { EmailQueue, EmailType } from "../models/email-queue.model";
import { env } from "../config/env.config";

async function verifyEmailSystem() {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Mock Data
        const mockOrder = {
            _id: new mongoose.Types.ObjectId(),
            order_id: "ZUL-TEST-001",
            customer_details: {
                name: "Test Customer",
                email: "manish.bulchandani@gmail.com" // You can change this to a real email for testing
            }
        };

        console.log("1. Testing addToQueue (Order Confirmation)...");
        await EmailService.addToQueue(
            EmailType.ORDER_CONFIRMATION,
            mockOrder.customer_details.email,
            mockOrder._id,
            {
                orderId: mockOrder.order_id,
                customerName: mockOrder.customer_details.name,
                total: 999
            }
        );

        console.log("2. Verifying Queue Item...");
        const queuedItem = await EmailQueue.findOne({ order_id: mockOrder._id });

        if (!queuedItem) {
            console.error("❌ Failed: Queue item not found.");
            process.exit(1);
            return;
        }

        console.log("✅ Success: Queue item created.", queuedItem._id);
        console.log("   Status:", queuedItem.status);

        console.log("3. Processing Queue...");
        // This will try to send using Resend if API key is present
        await EmailService.processQueue();

        const processedItem = await EmailQueue.findById(queuedItem._id);

        if (!processedItem) {
            console.error("❌ Failed: Processed item not found.");
            process.exit(1);
            return;
        }

        console.log("   Final Status:", processedItem.status);
        if (processedItem.status === 'sent') {
            console.log("✅ Email sent successfully (Mock/Real).");
        } else if (processedItem.status === 'failed') {
            console.log("⚠️ Email failed (Expected if no API Key). Error:", processedItem.error || "Unknown error");
        }

        console.log("Verification Complete.");
        process.exit(0);
    } catch (error) {
        console.error("Verification Error:", error);
        process.exit(1);
    }
}

verifyEmailSystem();
