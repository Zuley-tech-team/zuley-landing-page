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
const express_1 = require("express");
const product_model_1 = require("../../models/product.model");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
const resolveProductByIdentifier = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
        return null;
    }
    const escapedIdentifier = trimmedIdentifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const lookups = [
        { sku: trimmedIdentifier },
        { sku: trimmedIdentifier.toLowerCase() },
        { sku: trimmedIdentifier.toUpperCase() },
    ];
    if (mongoose_1.default.Types.ObjectId.isValid(trimmedIdentifier)) {
        lookups.push({ _id: new mongoose_1.default.Types.ObjectId(trimmedIdentifier) });
    }
    for (const lookup of lookups) {
        const product = yield product_model_1.Product.findOne(lookup);
        if (product) {
            return product;
        }
    }
    return product_model_1.Product.findOne({
        $or: [
            { sku: new RegExp(`^${escapedIdentifier}$`, "i") },
            { name: new RegExp(`^${escapedIdentifier}$`, "i") },
        ],
    });
});
/**
 * Get all products (public)
 * GET /api/v1/products
 * Query params: category, badge, limit
 */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, badge, limit } = req.query;
        const query = { isActive: true };
        if (category) {
            query.category = category;
        }
        if (badge) {
            query.badge = badge;
        }
        let productsQuery = product_model_1.Product.find(query).sort({ createdAt: -1 });
        if (limit) {
            productsQuery = productsQuery.limit(Number(limit));
        }
        const products = yield productsQuery;
        res.json({
            success: true,
            data: products,
            count: products.length,
        });
    }
    catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
}));
/**
 * Get products by category (public)
 * GET /api/v1/products/category/:category
 */
router.get("/category/:category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        const products = yield product_model_1.Product.find({
            category,
            isActive: true,
        }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: products,
            count: products.length,
        });
    }
    catch (error) {
        console.error("Get Products by Category Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
}));
/**
 * Get all categories (public)
 * GET /api/v1/products/meta/categories
 */
router.get("/meta/categories", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield product_model_1.Product.distinct("category", { isActive: true });
        const categoryData = categories.map((slug) => ({
            slug,
            label: slug
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
        }));
        res.json({
            success: true,
            data: categoryData,
        });
    }
    catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
        });
    }
}));
/**
 * Get related products (public)
 * GET /api/v1/products/:sku/related
 */
router.get("/:sku/related", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sku } = req.params;
        const { limit = 4 } = req.query;
        const product = yield resolveProductByIdentifier(sku);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        const relatedProducts = yield product_model_1.Product.find({
            category: product.category,
            sku: { $ne: product.sku },
            isActive: true,
        }).limit(Number(limit));
        res.json({
            success: true,
            data: relatedProducts,
        });
    }
    catch (error) {
        console.error("Get Related Products Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch related products",
        });
    }
}));
/**
 * Get single product by SKU (public)
 * GET /api/v1/products/:sku
 */
router.get("/:sku", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sku } = req.params;
        const product = yield resolveProductByIdentifier(sku);
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error("Get Product Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
        });
    }
}));
exports.default = router;
