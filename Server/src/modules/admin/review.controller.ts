import { Request, Response } from "express";
import { Review } from "../../models/review.model";

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query as {
      page?: string;
      limit?: string;
      status?: string;
      search?: string;
    };

    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { order_id: searchRegex },
        { product_sku: searchRegex },
        { product_name: searchRegex },
        { customer_email: searchRegex },
        { customer_name: searchRegex },
      ];
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 20));
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
    console.error("[AdminReviews] getReviews error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const approveReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.status = "approved";
    review.decided_at = new Date();
    review.decided_by = req.admin._id;
    await review.save();

    return res.json({ success: true, data: review });
  } catch (error) {
    console.error("[AdminReviews] approveReview error:", error);
    return res.status(500).json({ message: "Failed to approve review" });
  }
};

export const rejectReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.status = "rejected";
    review.decided_at = new Date();
    review.decided_by = req.admin._id;
    await review.save();

    return res.json({ success: true, data: review });
  } catch (error) {
    console.error("[AdminReviews] rejectReview error:", error);
    return res.status(500).json({ message: "Failed to reject review" });
  }
};
