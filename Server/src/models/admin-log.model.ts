import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
    {
        admin_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        target_type: {
            type: String, // 'order', 'inventory', 'shipment', 'payment', 'system'
            required: true,
        },
        target_id: {
            type: String, // Flexible, could be ObjectId or string ID
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
        },
        ip_address: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Logs are immutable
    }
);

// Index for quick lookup by admin or target
adminLogSchema.index({ admin_id: 1, createdAt: -1 });
adminLogSchema.index({ target_type: 1, target_id: 1 });

export const AdminLog = mongoose.model("AdminLog", adminLogSchema);
