import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
    {
        sku: {
            type: String,
            required: true,
            index: true,
            description: "SKU of the item changed",
        },
        inventory_id: {
            type: mongoose.Schema.Types.ObjectId,
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order", // Optional, if related to an order
        },
        changed_by: {
            type: String,
            default: "system", // or admin username/ID
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: false },
    }
);

export const InventoryLog = mongoose.model("InventoryLog", inventoryLogSchema);
