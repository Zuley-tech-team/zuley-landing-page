import mongoose from "mongoose";
import { Admin } from "../models/admin.model";
import { env } from "../config/env.config";

async function createAdmin() {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log("Connected to MongoDB");

        const email = process.argv[2] || "admin@zuley.in";
        const password = process.argv[3] || "Zuley@1770";
        const name = process.argv[4] || "Admin User";

        console.log(`Creating admin: ${email}`);

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log("Admin with this email already exists. Updating password...");
            existingAdmin.password = password;
            await existingAdmin.save();
            console.log("✅ Admin updated successfully.");
            process.exit(0);
        }

        const admin = await Admin.create({
            email,
            password, // Will be hashed by pre-save hook
            name,
            role: "superadmin"
        });

        console.log(`✅ Admin created successfully: ${admin.email}`);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
}

createAdmin();
