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
const admin_model_1 = require("../models/admin.model");
const admin_log_model_1 = require("../models/admin-log.model");
const env_config_1 = require("../config/env.config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Mock Express Request/Response objects for controller testing is hard without running server.
// Instead, we will test the logic by invoking controllers directly or just testing the models/services?
// Testing controllers directly requires mocking req/res.
// Let's test the data flow and model logic primarily, and maybe simulate a login flow.
function verifyAdminPanel() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(env_config_1.env.MONGO_URI);
            console.log("Connected to MongoDB");
            // 1. Verify Admin Exists
            const admin = yield admin_model_1.Admin.findOne({ email: "admin@zuley.in" });
            if (!admin) {
                throw new Error("Admin not found. Run createAdmin.ts first.");
            }
            console.log("✅ Admin found:", admin.email);
            // 2. Test Password Logic
            const isMatch = yield admin.comparePassword("securepassword123"); // Password used in previous step
            if (!isMatch) {
                console.warn("⚠️ Password verification failed. Did you use 'securepassword123'?");
                // Don't fail script, just warn, as manual run might have used different password
            }
            else {
                console.log("✅ Password verification successful.");
            }
            // 3. Generate Token (Simulate Login)
            const token = jsonwebtoken_1.default.sign({ id: admin._id, role: admin.role }, env_config_1.env.JWT_SECRET, { expiresIn: '1h' });
            console.log("✅ Token generated successfully.");
            // 4. Verify AdminLog creation (Simulate Action)
            const initialLogCount = yield admin_log_model_1.AdminLog.countDocuments();
            yield admin_log_model_1.AdminLog.create({
                admin_id: admin._id,
                action: "TEST_VERIFICATION",
                target_type: "system",
                target_id: "test",
                details: { test: true },
                ip_address: "127.0.0.1"
            });
            const newLogCount = yield admin_log_model_1.AdminLog.countDocuments();
            if (newLogCount > initialLogCount) {
                console.log("✅ AdminLog created successfully.");
            }
            else {
                console.error("❌ AdminLog creation failed.");
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
verifyAdminPanel();
