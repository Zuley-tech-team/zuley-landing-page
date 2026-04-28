import { Router, Request, Response } from "express";
import { Product } from "../../models/product.model";
import mongoose from "mongoose";

const router = Router();

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
      { sku: new RegExp(`^${escapedIdentifier}$`, "i") },
      { name: new RegExp(`^${escapedIdentifier}$`, "i") },
    ],
  });
};

/**
 * Get all products (public)
 * GET /api/v1/products
 * Query params: category, badge, limit
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, badge, limit } = req.query;

    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (badge) {
      query.badge = badge;
    }

    let productsQuery = Product.find(query).sort({ createdAt: -1 });

    if (limit) {
      productsQuery = productsQuery.limit(Number(limit));
    }

    const products = await productsQuery;

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

/**
 * Get products by category (public)
 * GET /api/v1/products/category/:category
 */
router.get("/category/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    const products = await Product.find({
      category,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Get Products by Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

/**
 * Get all categories (public)
 * GET /api/v1/products/meta/categories
 */
router.get("/meta/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });

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
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

/**
 * Get related products (public)
 * GET /api/v1/products/:sku/related
 */
router.get("/:sku/related", async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const { limit = 4 } = req.query;

    const product = await resolveProductByIdentifier(sku);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const relatedProducts = await Product.find({
      category: product.category,
      sku: { $ne: product.sku },
      isActive: true,
    }).limit(Number(limit));

    res.json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    console.error("Get Related Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch related products",
    });
  }
});

/**
 * Get single product by SKU (public)
 * GET /api/v1/products/:sku
 */
router.get("/:sku", async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;

    const product = await resolveProductByIdentifier(sku);

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
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

export default router;
