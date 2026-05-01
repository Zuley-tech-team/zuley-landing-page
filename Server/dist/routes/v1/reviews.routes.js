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
const review_model_1 = require("../../models/review.model");
const router = (0, express_1.Router)();
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { product_sku, page = "1", limit = "12" } = req.query;
        const query = { status: "approved" };
        if (product_sku) {
            query.product_sku = product_sku;
        }
        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.min(50, Math.max(1, Number(limit) || 12));
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
        return next(error);
    }
}));
exports.default = router;
