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
exports.updateStock = exports.getInventory = void 0;
const inventory_model_1 = require("../../models/inventory.model");
const inventory_log_model_1 = require("../../models/inventory.log.model");
const admin_logger_service_1 = require("../../services/admin-logger.service");
const mongoose_1 = __importDefault(require("mongoose"));
const getInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20, search, status } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { sku: new RegExp(search, 'i') },
                // product_name if we had it directly on inventory, but usually inventory links to Product
                // Inventory model structure: { sku, quantity, ... }
                // If we want product details we need populate.
            ];
        }
        if (status === 'low_stock') {
            query.$expr = {
                $and: [
                    { $gt: ["$quantity", 0] },
                    { $lte: ["$quantity", "$low_stock_threshold"] },
                ],
            };
        }
        else if (status === 'out_of_stock') {
            query.quantity = { $lte: 0 };
        }
        const items = yield inventory_model_1.Inventory.find(query)
            .sort({ last_updated: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield inventory_model_1.Inventory.countDocuments(query);
        res.json({
            success: true,
            data: items,
            pagination: {
                current: Number(page),
                total: Math.ceil(total / Number(limit)),
                count: total,
            }
        });
    }
    catch (error) {
        console.error("Get Inventory Error:", error);
        res.status(500).json({ message: "Failed to fetch inventory" });
    }
});
exports.getInventory = getInventory;
const updateStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { sku, quantity, reason, lowStockThreshold } = req.body;
        if (!sku || quantity === undefined) {
            return res.status(400).json({ message: "SKU and quantity are required" });
        }
        const nextQuantity = Number(quantity);
        const nextThreshold = lowStockThreshold !== undefined ? Number(lowStockThreshold) : undefined;
        if (!Number.isFinite(nextQuantity) || nextQuantity < 0) {
            yield session.abortTransaction();
            return res.status(400).json({ message: "Quantity must be a non-negative number" });
        }
        if (nextThreshold !== undefined && (!Number.isFinite(nextThreshold) || nextThreshold < 0)) {
            yield session.abortTransaction();
            return res.status(400).json({ message: "Low stock threshold must be a non-negative number" });
        }
        const inventory = yield inventory_model_1.Inventory.findOne({ sku }).session(session);
        if (!inventory) {
            // Option to create if not exists?
            // For now, strict update.
            yield session.abortTransaction();
            return res.status(404).json({ message: "SKU not found" });
        }
        const previousQuantity = inventory.quantity;
        const previousThreshold = inventory.low_stock_threshold;
        // Set absolute quantity (as per admin UI usually works "Update to X")
        // Or relative? Requirement says "Enter new quantity", usually implies absolute.
        inventory.quantity = nextQuantity;
        if (nextThreshold !== undefined) {
            inventory.low_stock_threshold = nextThreshold;
        }
        yield inventory.save({ session });
        // Log to InventoryLog
        yield inventory_log_model_1.InventoryLog.create([{
                sku,
                inventory_id: inventory._id,
                change_quantity: nextQuantity - previousQuantity,
                reason: "correction",
                order_id: null,
                previous_quantity: previousQuantity,
                new_quantity: nextQuantity,
                changed_by: `admin:${req.admin.email}`,
            }], { session });
        // Log Admin Action
        yield admin_logger_service_1.AdminLogger.logAction(req.admin._id, "UPDATE_STOCK", "inventory", sku, {
            previous: previousQuantity,
            new: nextQuantity,
            previousThreshold,
            newThreshold: inventory.low_stock_threshold,
            reason,
        }, req);
        yield session.commitTransaction();
        res.json({ success: true, data: inventory });
    }
    catch (error) {
        yield session.abortTransaction();
        console.error("Update Stock Error:", error);
        res.status(500).json({ message: "Failed to update stock" });
    }
    finally {
        session.endSession();
    }
});
exports.updateStock = updateStock;
