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
exports.restoreStock = exports.reserveStock = exports.checkStock = void 0;
const inventory_model_1 = require("../../models/inventory.model");
const inventory_log_model_1 = require("../../models/inventory.log.model");
const mongoose_1 = __importDefault(require("mongoose"));
const checkStock = (sku, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield inventory_model_1.Inventory.findOne({ sku });
    if (!item)
        return false;
    return item.quantity >= quantity;
});
exports.checkStock = checkStock;
// Simple audit helper
const createAuditLog = (sku, inventoryId, previousQty, newQty, change, reason, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield inventory_log_model_1.InventoryLog.create({
            sku,
            inventory_id: inventoryId,
            previous_quantity: previousQty,
            new_quantity: newQty,
            change_quantity: change,
            reason,
            order_id: mongoose_1.default.isValidObjectId(orderId) ? orderId : null,
            changed_by: "system"
        });
    }
    catch (e) {
        console.error(`Failed to log inventory change for SKU ${sku}`, e);
    }
});
/**
 * Reserve stock (decrement) atomically.
 * Used when an order is successful.
 * Returns true if successful, false if stock not available.
 * Includes retry logic for TransientTransactionError/WriteConflict.
 */
const reserveStock = (sku, quantity, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    // Retry logic for WriteConflict
    const MAX_RETRIES = 10;
    let retries = 0;
    while (retries < MAX_RETRIES) {
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Find and atomic update in one go to prevent race conditions
            // Filter ensures we only update if quantity is sufficient
            const updatedItem = yield inventory_model_1.Inventory.findOneAndUpdate({ sku: sku, quantity: { $gte: quantity } }, { $inc: { quantity: -quantity } }, { new: true, session });
            if (!updatedItem) {
                // Stock not available or SKU not found
                yield session.abortTransaction();
                session.endSession();
                return false;
            }
            // Log the change
            const previousQty = updatedItem.quantity + quantity;
            yield createAuditLog(sku, updatedItem._id, previousQty, updatedItem.quantity, -quantity, "sale", orderId);
            yield session.commitTransaction();
            session.endSession();
            return true;
        }
        catch (error) {
            yield session.abortTransaction();
            session.endSession();
            if ((error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError')) || error.code === 112) {
                retries++;
                const delay = Math.pow(2, retries) * (50 + Math.random() * 50); // Jittered backoff
                console.log(`Transaction retry ${retries} for SKU ${sku} due to WriteConflict/TransientError`);
                yield new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            console.error(`Error reserving stock for SKU ${sku}:`, error);
            throw error;
        }
    }
    return false; // Failed after retries
});
exports.reserveStock = reserveStock;
/**
 * Restore stock (increment) atomically.
 * Used for refunds, cancellations, or manual restock.
 */
const restoreStock = (sku, quantity, reason, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const item = yield inventory_model_1.Inventory.findOne({ sku }).session(session);
        if (!item) {
            // Simplest: fail if not exists.
            throw new Error(`Inventory item not found for SKU ${sku}`);
        }
        const previousQty = item.quantity;
        item.quantity += quantity;
        yield item.save({ session });
        yield createAuditLog(sku, item._id, previousQty, item.quantity, quantity, reason, orderId);
        yield session.commitTransaction();
        session.endSession();
    }
    catch (error) {
        console.error(`Error restoring stock for SKU ${sku}:`, error);
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.restoreStock = restoreStock;
