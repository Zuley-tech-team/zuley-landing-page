import { Inventory } from "../../models/inventory.model";
import { InventoryLog } from "../../models/inventory.log.model";
import mongoose from "mongoose";

export const checkStock = async (sku: string, quantity: number): Promise<boolean> => {
    const item = await Inventory.findOne({ sku });
    if (!item) return false;
    return item.quantity >= quantity;
};

// Simple audit helper
const createAuditLog = async (
    sku: string,
    inventoryId: any,
    previousQty: number,
    newQty: number,
    change: number,
    reason: string,
    orderId?: any
) => {
    try {
        await InventoryLog.create({
            sku,
            inventory_id: inventoryId,
            previous_quantity: previousQty,
            new_quantity: newQty,
            change_quantity: change,
            reason,
            order_id: mongoose.isValidObjectId(orderId) ? orderId : null,
            changed_by: "system"
        });
    } catch (e) {
        console.error(`Failed to log inventory change for SKU ${sku}`, e);
    }
};

/**
 * Reserve stock (decrement) atomically.
 * Used when an order is successful.
 * Returns true if successful, false if stock not available.
 * Includes retry logic for TransientTransactionError/WriteConflict.
 */
export const reserveStock = async (sku: string, quantity: number, orderId?: any): Promise<boolean> => {
    // Retry logic for WriteConflict
    const MAX_RETRIES = 10;
    let retries = 0;

    while (retries < MAX_RETRIES) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find and atomic update in one go to prevent race conditions
            // Filter ensures we only update if quantity is sufficient
            const updatedItem = await Inventory.findOneAndUpdate(
                { sku: sku, quantity: { $gte: quantity } },
                { $inc: { quantity: -quantity } },
                { new: true, session }
            );

            if (!updatedItem) {
                // Stock not available or SKU not found
                await session.abortTransaction();
                session.endSession();
                return false;
            }

            // Log the change
            const previousQty = updatedItem.quantity + quantity;
            await createAuditLog(sku, updatedItem._id, previousQty, updatedItem.quantity, -quantity, "sale", orderId);

            await session.commitTransaction();
            session.endSession();
            return true;

        } catch (error: any) {
            await session.abortTransaction();
            session.endSession();

            if ((error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError')) || error.code === 112) {
                retries++;
                const delay = Math.pow(2, retries) * (50 + Math.random() * 50); // Jittered backoff
                console.log(`Transaction retry ${retries} for SKU ${sku} due to WriteConflict/TransientError`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            console.error(`Error reserving stock for SKU ${sku}:`, error);
            throw error;
        }
    }
    return false; // Failed after retries
};

/**
 * Restore stock (increment) atomically.
 * Used for refunds, cancellations, or manual restock.
 */
export const restoreStock = async (sku: string, quantity: number, reason: string, orderId?: any): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const item = await Inventory.findOne({ sku }).session(session);

        if (!item) {
            // Simplest: fail if not exists.
            throw new Error(`Inventory item not found for SKU ${sku}`);
        }

        const previousQty = item.quantity;
        item.quantity += quantity;
        await item.save({ session });

        await createAuditLog(sku, item._id, previousQty, item.quantity, quantity, reason, orderId);

        await session.commitTransaction();
        session.endSession();

    } catch (error) {
        console.error(`Error restoring stock for SKU ${sku}:`, error);
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
