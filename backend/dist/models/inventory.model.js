"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const inventorySchema = new mongoose_1.default.Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    reserved: {
        type: Number,
        default: 0,
        description: "Quantity reserved for pending orders (optimistic locking)",
    },
    // Optional: Low stock threshold for alerts
    low_stock_threshold: {
        type: Number,
        default: 5,
    },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "last_updated" },
});
exports.Inventory = mongoose_1.default.model("Inventory", inventorySchema);
