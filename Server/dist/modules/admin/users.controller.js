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
exports.getUserDetails = exports.getUsers = void 0;
const user_model_1 = require("../../models/user.model");
const order_model_1 = require("../../models/order.model");
/**
 * GET /api/v1/admin/users
 * Returns a paginated list of users (for the Admin "Users" tab).
 */
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }
        const [users, total] = yield Promise.all([
            user_model_1.User.find(query)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            user_model_1.User.countDocuments(query)
        ]);
        return res.json({
            success: true,
            data: users,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: total
            }
        });
    }
    catch (error) {
        console.error("[Admin Users] getUsers error:", error);
        return res.status(500).json({ message: "Failed to fetch users" });
    }
});
exports.getUsers = getUsers;
/**
 * GET /api/v1/admin/users/:id
 * Returns full details of a specific user including their order history and most recent shipping address.
 */
const getUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_model_1.User.findById(id).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Fetch all orders associated with this user's email
        const orders = yield order_model_1.Order.find({ "customer_details.email": user.email })
            .sort({ createdAt: -1 })
            .lean();
        // Extract most recent shipping address from their latest order
        const recentAddress = orders.length > 0 ? orders[0].shipping_address : null;
        return res.json({
            success: true,
            data: {
                user,
                recent_address: recentAddress,
                orders,
                order_count: orders.length,
                total_spent: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
            }
        });
    }
    catch (error) {
        console.error("[Admin Users] getUserDetails error:", error);
        return res.status(500).json({ message: "Failed to fetch user details" });
    }
});
exports.getUserDetails = getUserDetails;
