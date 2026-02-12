import { Request, Response } from "express";
import { Inventory } from "../../models/inventory.model";
import { InventoryLog } from "../../models/inventory.log.model";
import { AdminLogger } from "../../services/admin-logger.service";
import mongoose from "mongoose";

export const getInventory = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;

        const query: any = {};

        if (search) {
            query.$or = [
                { sku: new RegExp(search as string, 'i') },
                // product_name if we had it directly on inventory, but usually inventory links to Product
                // Inventory model structure: { sku, quantity, ... }
                // If we want product details we need populate.
            ];
        }

        if (status === 'low_stock') {
            query.quantity = { $lt: 10 }; // Example threshold
        } else if (status === 'out_of_stock') {
            query.quantity = { $lte: 0 };
        }

        const items = await Inventory.find(query)
            .sort({ updatedAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Inventory.countDocuments(query);

        res.json({
            success: true,
            data: items,
            pagination: {
                current: Number(page),
                total: Math.ceil(total / Number(limit)),
                count: total,
            }
        });
    } catch (error) {
        console.error("Get Inventory Error:", error);
        res.status(500).json({ message: "Failed to fetch inventory" });
    }
};

export const updateStock = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { sku, quantity, reason } = req.body;

        if (!sku || quantity === undefined) {
            return res.status(400).json({ message: "SKU and quantity are required" });
        }

        const inventory = await Inventory.findOne({ sku }).session(session);
        if (!inventory) {
            // Option to create if not exists?
            // For now, strict update.
            await session.abortTransaction();
            return res.status(404).json({ message: "SKU not found" });
        }

        const previousQuantity = inventory.quantity;

        // Set absolute quantity (as per admin UI usually works "Update to X")
        // Or relative? Requirement says "Enter new quantity", usually implies absolute.
        inventory.quantity = Number(quantity);
        await inventory.save({ session });

        // Log to InventoryLog
        await InventoryLog.create([{
            sku,
            change: Number(quantity) - previousQuantity,
            reason: reason || "Admin Manual Update",
            order_id: null,
            previous_quantity: previousQuantity,
            new_quantity: Number(quantity)
        }], { session });

        // Log Admin Action
        await AdminLogger.logAction(
            req.admin._id,
            "UPDATE_STOCK",
            "inventory",
            sku,
            { previous: previousQuantity, new: Number(quantity), reason },
            req
        );

        await session.commitTransaction();
        res.json({ success: true, data: inventory });

    } catch (error) {
        await session.abortTransaction();
        console.error("Update Stock Error:", error);
        res.status(500).json({ message: "Failed to update stock" });
    } finally {
        session.endSession();
    }
};
