import { Router } from "express";
import { Inventory } from "../../models/inventory.model";

const router = Router();

/**
 * Public Stock Availability Endpoint
 * GET /api/v1/inventory/:sku/availability
 *
 * Returns stock availability for a given SKU.
 * Does NOT expose exact quantity to customers — only in-stock/out-of-stock.
 */
router.get("/:sku/availability", async (req, res) => {
    try {
        const { sku } = req.params;

        const item = await Inventory.findOne({ sku });

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
    } catch (error) {
        console.error("Stock Check Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check stock",
        });
    }
});

export default router;
