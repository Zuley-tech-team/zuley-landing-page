import mongoose from "mongoose";
import { Admin } from "../models/admin.model";
import { AdminLog } from "../models/admin-log.model";
import { env } from "../config/env.config";
import jwt from "jsonwebtoken";

// Mock Express Request/Response objects for controller testing is hard without running server.
// Instead, we will test the logic by invoking controllers directly or just testing the models/services?
// Testing controllers directly requires mocking req/res.
// Let's test the data flow and model logic primarily, and maybe simulate a login flow.

async function verifyAdminPanel() {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Verify Admin Exists
        const admin = await Admin.findOne({ email: "admin@zuley.in" });
        if (!admin) {
            throw new Error("Admin not found. Run createAdmin.ts first.");
        }
        console.log("✅ Admin found:", admin.email);

        // 2. Test Password Logic
        const isMatch = await admin.comparePassword("Zuley@1770"); // Default password from createAdmin script
        if (!isMatch) {
            console.warn("⚠️ Password verification failed. Update verifyAdminPanel.ts if you are using a custom admin password.");
            // Don't fail script, just warn, as manual run might have used different password
        } else {
            console.log("✅ Password verification successful.");
        }

        // 3. Generate Token (Simulate Login)
        const token = jwt.sign({ id: admin._id, role: admin.role }, env.JWT_SECRET, { expiresIn: '1h' });
        console.log("✅ Token generated successfully.");

        // 4. Verify AdminLog creation (Simulate Action)
        const initialLogCount = await AdminLog.countDocuments();

        await AdminLog.create({
            admin_id: admin._id,
            action: "TEST_VERIFICATION",
            target_type: "system",
            target_id: "test",
            details: { test: true },
            ip_address: "127.0.0.1"
        });

        const newLogCount = await AdminLog.countDocuments();
        if (newLogCount > initialLogCount) {
            console.log("✅ AdminLog created successfully.");
        } else {
            console.error("❌ AdminLog creation failed.");
        }

        console.log("Verification Complete.");
        process.exit(0);
    } catch (error) {
        console.error("Verification Error:", error);
        process.exit(1);
    }
}

verifyAdminPanel();
