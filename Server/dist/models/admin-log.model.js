"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const adminLogSchema = new mongoose_1.default.Schema({
    admin_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.Mixed,
    },
    ip_address: {
        type: String,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false }, // Logs are immutable
});
// Index for quick lookup by admin or target
adminLogSchema.index({ admin_id: 1, createdAt: -1 });
adminLogSchema.index({ target_type: 1, target_id: 1 });
exports.AdminLog = mongoose_1.default.model("AdminLog", adminLogSchema);
