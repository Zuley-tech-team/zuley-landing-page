import { Router } from "express";
import { Review } from "../../models/review.model";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { product_sku, page = "1", limit = "12" } = req.query as {
      product_sku?: string;
      page?: string;
      limit?: string;
    };

    const query: any = { status: "approved" };
    if (product_sku) {
      query.product_sku = product_sku;
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 12));
    const skip = (pageNumber - 1) * limitNumber;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Review.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: reviews,
      pagination: {
        current: pageNumber,
        total: Math.ceil(total / limitNumber) || 1,
        count: total,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
