import { Request, Response } from "express";
import { Product } from "../../models/product.model";
import { Inventory } from "../../models/inventory.model";
import { Order } from "../../models/order.model";
import { AdminLogger } from "../../services/admin-logger.service";
import mongoose from "mongoose";
import { uploadImageBuffer, uploadDataUrlImage, isDataUrlImage } from "../../services/cloudinary.service";

const resolveProductByIdentifier = async (identifier: string) => {
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

    if (mongoose.Types.ObjectId.isValid(trimmedIdentifier)) {
        lookups.push({ _id: new mongoose.Types.ObjectId(trimmedIdentifier) } as any);
    }

    for (const lookup of lookups) {
        const product = await Product.findOne(lookup);
        if (product) {
            return product;
        }
    }

    return Product.findOne({
        $or: [
            { sku: new RegExp(`^\\s*${escapedIdentifier}\\s*$`, "i") },
            { name: new RegExp(`^\\s*${escapedIdentifier}\\s*$`, "i") },
        ],
    });
};

const normalizeImageValue = async (value: unknown, index: number, sku: string) => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return null;
    }

    if (isDataUrlImage(trimmedValue)) {
        const safeSku = sku.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-") || "product";
        const uploaded = await uploadDataUrlImage(trimmedValue, {
            folder: `zuley/products/${safeSku}`,
            publicId: `${Date.now()}-${index}-${safeSku}`,
        });

        return uploaded.secure_url;
    }

    return trimmedValue;
};

const normalizeImageList = async (image: unknown, images: unknown, sku: string) => {
    const candidateImages = [image];

    if (Array.isArray(images)) {
        candidateImages.push(...images);
    } else if (typeof images === "string") {
        candidateImages.push(images);
    }

    const normalizedImages = [] as string[];

    for (let index = 0; index < candidateImages.length; index += 1) {
        const normalized = await normalizeImageValue(candidateImages[index], index, sku);
        if (normalized) {
            normalizedImages.push(normalized);
        }
    }

    return Array.from(new Set(normalizedImages));
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search, category, status } = req.query;

        const query: any = {};

        if (search) {
            query.$or = [
                { name: new RegExp(search as string, "i") },
                { sku: new RegExp(search as string, "i") },
                { description: new RegExp(search as string, "i") },
            ];
        }

        if (category) {
            query.category = category;
        }

        if (status === "active") {
            query.isActive = true;
        } else if (status === "inactive") {
            query.isActive = false;
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: {
                current: Number(page),
                total: Math.ceil(total / Number(limit)),
                count: total,
            },
        });
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await resolveProductByIdentifier(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const inventory = await Inventory.findOne({ sku: product.sku });

        res.json({
            success: true,
            data: {
                ...product.toObject(),
                stock: inventory?.quantity || 0,
                reserved: inventory?.reserved || 0,
            },
        });
    } catch (error) {
        console.error("Get Product Error:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    let session: mongoose.ClientSession | null = null;

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
        const lowStockThreshold = Number(req.body.lowStockThreshold ?? 5);

        const imageList = await normalizeImageList(req.body.image, req.body.images, sku);
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

        session = await mongoose.startSession();
        session.startTransaction();

        const existingProduct = await Product.findOne({ sku }).session(session);
        if (existingProduct) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Product with this SKU already exists" });
        }

        const product = new Product({
            sku,
            name,
            category,
            categoryLabel: categoryLabel || category.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
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

        await product.save({ session });

        await Inventory.create(
            [{
                sku,
                quantity: initialStock,
                reserved: 0,
                low_stock_threshold: lowStockThreshold,
            }],
            { session }
        );

        await AdminLogger.logAction(
            req.admin._id,
            "CREATE_PRODUCT",
            "product",
            sku,
            { name, price, initialStock, lowStockThreshold },
            req
        );

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            data: product,
            message: "Product created successfully",
        });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ message: "Failed to create product" });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates: any = { ...req.body };

        updates.name = typeof updates.name === "string" ? updates.name.trim() : updates.name;
        updates.category = typeof updates.category === "string" ? updates.category.trim() : updates.category;
        updates.categoryLabel = typeof updates.categoryLabel === "string" ? updates.categoryLabel.trim() : updates.categoryLabel;
        updates.description = typeof updates.description === "string" ? updates.description.trim() : updates.description;
        updates.longDescription = typeof updates.longDescription === "string" ? updates.longDescription.trim() : updates.longDescription;
        updates.badge = typeof updates.badge === "string" ? updates.badge.trim() : updates.badge;
        updates.price = updates.price !== undefined ? Number(updates.price) : updates.price;
        updates.originalPrice = updates.originalPrice ? Number(updates.originalPrice) : undefined;

        const product = await resolveProductByIdentifier(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const normalizedImages = await normalizeImageList(updates.image, updates.images, product.sku);

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
        await product.save();

        await AdminLogger.logAction(
            req.admin._id,
            "UPDATE_PRODUCT",
            "product",
            id,
            { old: oldData, new: updates },
            req
        );

        res.json({
            success: true,
            data: product,
            message: "Product updated successfully",
        });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ message: "Failed to update product" });
    }
};

export const uploadProductImages = async (req: Request, res: Response) => {
    try {
        const files = (req.files as any[] | undefined) || [];

        if (files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        const uploadedImages = await Promise.all(
            files.map((file, index) =>
                uploadImageBuffer(file.buffer, {
                    folder: "zuley/products",
                    publicId: `${Date.now()}-${index}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-")}`,
                })
            )
        );

        res.status(201).json({
            success: true,
            data: uploadedImages.map((image: { secure_url: string; public_id: string }) => ({
                url: image.secure_url,
                publicId: image.public_id,
            })),
            message: "Images uploaded successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload product images";
        console.error("Upload Product Images Error:", error);
        res.status(500).json({ message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({ sku: id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isActive = false;
        await product.save();

        await AdminLogger.logAction(
            req.admin._id,
            "DELETE_PRODUCT",
            "product",
            id,
            { name: product.name },
            req
        );

        res.json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ message: "Failed to delete product" });
    }
};

export const toggleProductStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({ sku: id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isActive = !product.isActive;
        await product.save();

        await AdminLogger.logAction(
            req.admin._id,
            product.isActive ? "ACTIVATE_PRODUCT" : "DEACTIVATE_PRODUCT",
            "product",
            id,
            { name: product.name, isActive: product.isActive },
            req
        );

        res.json({
            success: true,
            data: product,
            message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
        });
    } catch (error) {
        console.error("Toggle Product Status Error:", error);
        res.status(500).json({ message: "Failed to toggle product status" });
    }
};

export const getProductStats = async (_req: Request, res: Response) => {
    try {
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ isActive: true });
        const inactiveProducts = await Product.countDocuments({ isActive: false });

        const lowStockItems = await Inventory.find({
            $expr: { $lt: ["$quantity", "$low_stock_threshold"] },
        });

        const outOfStock = await Inventory.countDocuments({ quantity: { $lte: 0 } });

        const categoryBreakdown = await Product.aggregate([
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
    } catch (error) {
        console.error("Get Product Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch product stats" });
    }
};

export const getDashboardStats = async (_req: Request, res: Response) => {
    try {
        // Product stats
        const totalProducts = await Product.countDocuments({ isActive: true });

        // Order stats
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: { $in: ["created", "paid"] } });
        const shippedOrders = await Order.countDocuments({ status: "shipped" });
        const deliveredOrders = await Order.countDocuments({ status: "delivered" });

        // Revenue (sum of all paid/shipped/delivered orders)
        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
            { $group: { _id: null, total: { $sum: "$total_amount" } } },
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Low stock alerts
        const lowStockItems = await Inventory.find({
            $expr: { $lt: ["$quantity", "$low_stock_threshold"] },
        }).limit(10);

        // Recent orders
        const recentOrders = await Order.find()
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
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
};
