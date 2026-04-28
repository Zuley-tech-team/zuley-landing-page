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
exports.getDashboardStats = exports.getProductStats = exports.toggleProductStatus = exports.deleteProduct = exports.uploadProductImages = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const product_model_1 = require("../../models/product.model");
const inventory_model_1 = require("../../models/inventory.model");
const order_model_1 = require("../../models/order.model");
const admin_logger_service_1 = require("../../services/admin-logger.service");
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_service_1 = require("../../services/cloudinary.service");
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
            { sku: new RegExp(`^\\s*${escapedIdentifier}\\s*$`, "i") },
            { name: new RegExp(`^\\s*${escapedIdentifier}\\s*$`, "i") },
        ],
    });
});
const normalizeImageValue = (value, index, sku) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof value !== "string") {
        return null;
    }
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return null;
    }
    if ((0, cloudinary_service_1.isDataUrlImage)(trimmedValue)) {
        const safeSku = sku.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-") || "product";
        const uploaded = yield (0, cloudinary_service_1.uploadDataUrlImage)(trimmedValue, {
            folder: `zuley/products/${safeSku}`,
            publicId: `${Date.now()}-${index}-${safeSku}`,
        });
        return uploaded.secure_url;
    }
    return trimmedValue;
});
const normalizeImageList = (image, images, sku) => __awaiter(void 0, void 0, void 0, function* () {
    const candidateImages = [image];
    if (Array.isArray(images)) {
        candidateImages.push(...images);
    }
    else if (typeof images === "string") {
        candidateImages.push(images);
    }
    const normalizedImages = [];
    for (let index = 0; index < candidateImages.length; index += 1) {
        const normalized = yield normalizeImageValue(candidateImages[index], index, sku);
        if (normalized) {
            normalizedImages.push(normalized);
        }
    }
    return Array.from(new Set(normalizedImages));
});
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20, search, category, status } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: new RegExp(search, "i") },
                { sku: new RegExp(search, "i") },
                { description: new RegExp(search, "i") },
            ];
        }
        if (category) {
            query.category = category;
        }
        if (status === "active") {
            query.isActive = true;
        }
        else if (status === "inactive") {
            query.isActive = false;
        }
        const products = yield product_model_1.Product.find(query)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield product_model_1.Product.countDocuments(query);
        res.json({
            success: true,
            data: products,
            pagination: {
                current: Number(page),
                total: Math.ceil(total / Number(limit)),
                count: total,
            },
        });
    }
    catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
});
exports.getProducts = getProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield resolveProductByIdentifier(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const inventory = yield inventory_model_1.Inventory.findOne({ sku: product.sku });
        res.json({
            success: true,
            data: Object.assign(Object.assign({}, product.toObject()), { stock: (inventory === null || inventory === void 0 ? void 0 : inventory.quantity) || 0, reserved: (inventory === null || inventory === void 0 ? void 0 : inventory.reserved) || 0 }),
        });
    }
    catch (error) {
        console.error("Get Product Error:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});
exports.getProductById = getProductById;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let session = null;
    try {
        const sku = typeof req.body.sku === "string" ? req.body.sku.trim() : "";
        const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
        const category = typeof req.body.category === "string" ? req.body.category.trim() : "";
        const categoryLabel = typeof req.body.categoryLabel === "string" ? req.body.categoryLabel.trim() : "";
        const price = Number(req.body.price);
        const originalPrice = req.body.originalPrice ? Number(req.body.originalPrice) : undefined;
        const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
        const longDescription = typeof req.body.longDescription === "string" ? req.body.longDescription.trim() : "";
        const badge = typeof req.body.badge === "string" ? req.body.badge.trim() : undefined;
        const features = Array.isArray(req.body.features) ? req.body.features : [];
        const specifications = req.body.specifications || {};
        const initialStock = Number(req.body.initialStock || 0);
        const lowStockThreshold = Number((_a = req.body.lowStockThreshold) !== null && _a !== void 0 ? _a : 5);
        const imageList = yield normalizeImageList(req.body.image, req.body.images, sku);
        const primaryImage = imageList[0];
        if (!sku || !name || !category || !price || !primaryImage || !description) {
            return res.status(400).json({
                message: "SKU, name, category, price, image, and description are required",
            });
        }
        if (!Number.isFinite(initialStock) || initialStock < 0 || !Number.isFinite(lowStockThreshold) || lowStockThreshold < 0) {
            return res.status(400).json({
                message: "Initial stock and low stock threshold must be non-negative numbers",
            });
        }
        session = yield mongoose_1.default.startSession();
        session.startTransaction();
        const existingProduct = yield product_model_1.Product.findOne({ sku }).session(session);
        if (existingProduct) {
            yield session.abortTransaction();
            return res.status(400).json({ message: "Product with this SKU already exists" });
        }
        const product = new product_model_1.Product({
            sku,
            name,
            category,
            categoryLabel: categoryLabel || category.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            price,
            originalPrice,
            image: primaryImage,
            images: imageList.length > 0 ? imageList : [primaryImage],
            description,
            longDescription,
            badge,
            features,
            specifications,
            isActive: true,
        });
        yield product.save({ session });
        yield inventory_model_1.Inventory.create([{
                sku,
                quantity: initialStock,
                reserved: 0,
                low_stock_threshold: lowStockThreshold,
            }], { session });
        yield admin_logger_service_1.AdminLogger.logAction(req.admin._id, "CREATE_PRODUCT", "product", sku, { name, price, initialStock, lowStockThreshold }, req);
        yield session.commitTransaction();
        res.status(201).json({
            success: true,
            data: product,
            message: "Product created successfully",
        });
    }
    catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ message: "Failed to create product" });
    }
    finally {
        if (session) {
            session.endSession();
        }
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = Object.assign({}, req.body);
        updates.name = typeof updates.name === "string" ? updates.name.trim() : updates.name;
        updates.category = typeof updates.category === "string" ? updates.category.trim() : updates.category;
        updates.categoryLabel = typeof updates.categoryLabel === "string" ? updates.categoryLabel.trim() : updates.categoryLabel;
        updates.description = typeof updates.description === "string" ? updates.description.trim() : updates.description;
        updates.longDescription = typeof updates.longDescription === "string" ? updates.longDescription.trim() : updates.longDescription;
        updates.badge = typeof updates.badge === "string" ? updates.badge.trim() : updates.badge;
        updates.price = updates.price !== undefined ? Number(updates.price) : updates.price;
        updates.originalPrice = updates.originalPrice ? Number(updates.originalPrice) : undefined;
        const product = yield resolveProductByIdentifier(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const normalizedImages = yield normalizeImageList(updates.image, updates.images, product.sku);
        if (normalizedImages.length > 0) {
            updates.images = normalizedImages;
            updates.image = normalizedImages[0];
        }
        if (typeof updates.sku === "string") {
            updates.sku = updates.sku.trim();
        }
        const oldData = product.toObject();
        delete updates._id;
        delete updates.createdAt;
        delete updates.updatedAt;
        Object.assign(product, updates);
        yield product.save();
        yield admin_logger_service_1.AdminLogger.logAction(req.admin._id, "UPDATE_PRODUCT", "product", id, { old: oldData, new: updates }, req);
        res.json({
            success: true,
            data: product,
            message: "Product updated successfully",
        });
    }
    catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ message: "Failed to update product" });
    }
});
exports.updateProduct = updateProduct;
const uploadProductImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files || [];
        if (files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }
        const uploadedImages = yield Promise.all(files.map((file, index) => (0, cloudinary_service_1.uploadImageBuffer)(file.buffer, {
            folder: "zuley/products",
            publicId: `${Date.now()}-${index}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-")}`,
        })));
        res.status(201).json({
            success: true,
            data: uploadedImages.map((image) => ({
                url: image.secure_url,
                publicId: image.public_id,
            })),
            message: "Images uploaded successfully",
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload product images";
        console.error("Upload Product Images Error:", error);
        res.status(500).json({ message });
    }
});
exports.uploadProductImages = uploadProductImages;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield product_model_1.Product.findOne({ sku: id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        product.isActive = false;
        yield product.save();
        yield admin_logger_service_1.AdminLogger.logAction(req.admin._id, "DELETE_PRODUCT", "product", id, { name: product.name }, req);
        res.json({
            success: true,
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ message: "Failed to delete product" });
    }
});
exports.deleteProduct = deleteProduct;
const toggleProductStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield product_model_1.Product.findOne({ sku: id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        product.isActive = !product.isActive;
        yield product.save();
        yield admin_logger_service_1.AdminLogger.logAction(req.admin._id, product.isActive ? "ACTIVATE_PRODUCT" : "DEACTIVATE_PRODUCT", "product", id, { name: product.name, isActive: product.isActive }, req);
        res.json({
            success: true,
            data: product,
            message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
        });
    }
    catch (error) {
        console.error("Toggle Product Status Error:", error);
        res.status(500).json({ message: "Failed to toggle product status" });
    }
});
exports.toggleProductStatus = toggleProductStatus;
const getProductStats = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalProducts = yield product_model_1.Product.countDocuments();
        const activeProducts = yield product_model_1.Product.countDocuments({ isActive: true });
        const inactiveProducts = yield product_model_1.Product.countDocuments({ isActive: false });
        const lowStockItems = yield inventory_model_1.Inventory.find({
            $expr: { $lt: ["$quantity", "$low_stock_threshold"] },
        });
        const outOfStock = yield inventory_model_1.Inventory.countDocuments({ quantity: { $lte: 0 } });
        const categoryBreakdown = yield product_model_1.Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
        ]);
        res.json({
            success: true,
            data: {
                totalProducts,
                activeProducts,
                inactiveProducts,
                lowStockCount: lowStockItems.length,
                outOfStockCount: outOfStock,
                categoryBreakdown,
            },
        });
    }
    catch (error) {
        console.error("Get Product Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch product stats" });
    }
});
exports.getProductStats = getProductStats;
const getDashboardStats = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Product stats
        const totalProducts = yield product_model_1.Product.countDocuments({ isActive: true });
        // Order stats
        const totalOrders = yield order_model_1.Order.countDocuments();
        const pendingOrders = yield order_model_1.Order.countDocuments({ status: { $in: ["created", "paid"] } });
        const shippedOrders = yield order_model_1.Order.countDocuments({ status: "shipped" });
        const deliveredOrders = yield order_model_1.Order.countDocuments({ status: "delivered" });
        // Revenue (sum of all paid/shipped/delivered orders)
        const revenueResult = yield order_model_1.Order.aggregate([
            { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
            { $group: { _id: null, total: { $sum: "$total_amount" } } },
        ]);
        const totalRevenue = ((_a = revenueResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        // Low stock alerts
        const lowStockItems = yield inventory_model_1.Inventory.find({
            $expr: { $lt: ["$quantity", "$low_stock_threshold"] },
        }).limit(10);
        // Recent orders
        const recentOrders = yield order_model_1.Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("order_id customer_details.name total_amount status createdAt");
        res.json({
            success: true,
            data: {
                products: {
                    total: totalProducts,
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders,
                },
                revenue: totalRevenue / 100, // Convert from paise to rupees
                lowStockAlerts: lowStockItems.map((item) => ({
                    sku: item.sku,
                    quantity: item.quantity,
                    threshold: item.low_stock_threshold,
                })),
                recentOrders,
            },
        });
    }
    catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
});
exports.getDashboardStats = getDashboardStats;
