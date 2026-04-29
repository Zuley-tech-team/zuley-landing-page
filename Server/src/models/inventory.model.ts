import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "last_updated" },
  }
);

export const Inventory = mongoose.model("Inventory", inventorySchema);
