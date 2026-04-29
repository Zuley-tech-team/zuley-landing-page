"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const inventoryLogSchema = new mongoose_1.default.Schema({
    sku: {
        type: String,
        required: true,
        index: true,
        description: "SKU of the item changed",
    },
    inventory_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Inventory",
        required: true,
    },
    previous_quantity: {
        type: Number,
        required: true,
    },
    new_quantity: {
        type: Number,
        required: true,
    },
    change_quantity: {
        type: Number,
        required: true,
        description: "The amount changed (positive for add, negative for remove)",
    },
    reason: {
        type: String,
        required: true,
        enum: ["sale", "restock", "correction", "damage", "return", "cancellation", "refund", "reserved"],
    },
    order_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Order", // Optional, if related to an order
    },
    changed_by: {
        type: String,
        default: "system", // or admin username/ID
    },
}, {
    timestamps: { createdAt: "created_at", updatedAt: false },
});
exports.InventoryLog = mongoose_1.default.model("InventoryLog", inventoryLogSchema);
