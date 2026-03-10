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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_model_1 = require("../../models/inventory.model");
const router = (0, express_1.Router)();
/**
 * Public Stock Availability Endpoint
 * GET /api/v1/inventory/:sku/availability
 *
 * Returns stock availability for a given SKU.
 * Does NOT expose exact quantity to customers — only in-stock/out-of-stock.
 */
router.get("/:sku/availability", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sku } = req.params;
        const item = yield inventory_model_1.Inventory.findOne({ sku });
        if (!item) {
            // SKU not found in inventory — treat as available
            // (product exists in catalog but inventory not yet seeded)
            return res.json({
                success: true,
                data: {
                    sku,
                    inStock: true,
                    lowStock: false,
                },
            });
        }
        const inStock = item.quantity > 0;
        const lowStock = item.quantity > 0 && item.quantity <= 5;
        res.json({
            success: true,
            data: {
                sku,
                inStock,
                lowStock,
            },
        });
    }
    catch (error) {
        console.error("Stock Check Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check stock",
        });
    }
}));
exports.default = router;
