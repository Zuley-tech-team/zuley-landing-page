import mongoose from "mongoose";
import { Admin } from "../models/admin.model";
import { AdminLog } from "../models/admin-log.model";
import { env } from "../config/env.config";
import jwt from "jsonwebtoken";

/**
 * Verification script — checks that the admin record, JWT signing, and
 * AdminLog creation all work correctly.
 *
 * To also verify the password, set ADMIN_VERIFY_PASSWORD in your local .env
 * (never hardcode it here).
 */
async function verifyAdminPanel() {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Verify Admin Exists
        const admin = await Admin.findOne({ email: "admin@zuley.in" });
        if (!admin) {
            throw new Error("Admin not found. Use the admin creation CLI to create one.");
        }
        console.log("✅ Admin found:", admin.email);

        // 2. Test Password Logic (only if ADMIN_VERIFY_PASSWORD is set in env)
        const testPassword = process.env.ADMIN_VERIFY_PASSWORD;
        if (testPassword) {
            const isMatch = await admin.comparePassword(testPassword);
            if (!isMatch) {
                console.warn("⚠️  Password verification failed for the provided ADMIN_VERIFY_PASSWORD.");
            } else {
                console.log("✅ Password verification successful.");
            }
        } else {
            console.log("ℹ️  Skipping password check — set ADMIN_VERIFY_PASSWORD env var to enable.");
        }

        // 3. Generate Token (Simulate Login)
        const token = jwt.sign({ id: admin._id, role: admin.role }, env.JWT_SECRET, { expiresIn: "1h" });
        console.log("✅ Token generated successfully.");
        // Don't log the token itself — even in a script

        // 4. Verify AdminLog creation (Simulate Action)
        const initialLogCount = await AdminLog.countDocuments();

        await AdminLog.create({
            admin_id: admin._id,
            action: "TEST_VERIFICATION",
            target_type: "system",
            target_id: "test",
            details: { test: true },
            ip_address: "127.0.0.1",
        });

        const newLogCount = await AdminLog.countDocuments();
        if (newLogCount > initialLogCount) {
            console.log("✅ AdminLog created successfully.");
        } else {
            console.error("❌ AdminLog creation failed.");
        }

        console.log("Verification complete.");
        process.exit(0);
    } catch (error) {
        console.error("Verification error:", error);
        process.exit(1);
    }
}

verifyAdminPanel();
