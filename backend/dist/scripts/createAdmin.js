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
const env_config_1 = require("../config/env.config");
function createAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(env_config_1.env.MONGO_URI);
            console.log("Connected to MongoDB");
            const email = process.argv[2] || "admin@zuley.in";
            const password = process.argv[3] || "Zuley@1770";
            const name = process.argv[4] || "Admin User";
            console.log(`Creating admin: ${email}`);
            const existingAdmin = yield admin_model_1.Admin.findOne({ email });
            if (existingAdmin) {
                console.log("Admin with this email already exists. Updating password...");
                existingAdmin.password = password;
                yield existingAdmin.save();
                console.log("✅ Admin updated successfully.");
                process.exit(0);
            }
            const admin = yield admin_model_1.Admin.create({
                email,
                password, // Will be hashed by pre-save hook
                name,
                role: "superadmin"
            });
            console.log(`✅ Admin created successfully: ${admin.email}`);
            process.exit(0);
        }
        catch (error) {
            console.error("Error creating admin:", error);
            process.exit(1);
        }
    });
}
createAdmin();
