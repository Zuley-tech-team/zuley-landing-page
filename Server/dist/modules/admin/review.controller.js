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
exports.rejectReview = exports.approveReview = exports.getReviews = void 0;
const review_model_1 = require("../../models/review.model");
const getReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const query = {};
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
        const [reviews, total] = yield Promise.all([
            review_model_1.Review.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            review_model_1.Review.countDocuments(query),
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
    }
    catch (error) {
        console.error("[AdminReviews] getReviews error:", error);
        return res.status(500).json({ message: "Failed to fetch reviews" });
    }
});
exports.getReviews = getReviews;
const approveReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const review = yield review_model_1.Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        review.status = "approved";
        review.decided_at = new Date();
        review.decided_by = req.admin._id;
        yield review.save();
        return res.json({ success: true, data: review });
    }
    catch (error) {
        console.error("[AdminReviews] approveReview error:", error);
        return res.status(500).json({ message: "Failed to approve review" });
    }
});
exports.approveReview = approveReview;
const rejectReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const review = yield review_model_1.Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        review.status = "rejected";
        review.decided_at = new Date();
        review.decided_by = req.admin._id;
        yield review.save();
        return res.json({ success: true, data: review });
    }
    catch (error) {
        console.error("[AdminReviews] rejectReview error:", error);
        return res.status(500).json({ message: "Failed to reject review" });
    }
});
exports.rejectReview = rejectReview;
