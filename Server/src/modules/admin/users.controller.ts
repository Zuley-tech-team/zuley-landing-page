import { Request, Response } from "express";
import { User } from "../../models/user.model";
import { Order } from "../../models/order.model";

/**
 * GET /api/v1/admin/users
 * Returns a paginated list of users (for the Admin "Users" tab).
 */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;

        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User.countDocuments(query)
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
    } catch (error) {
        console.error("[Admin Users] getUsers error:", error);
        return res.status(500).json({ message: "Failed to fetch users" });
    }
};

/**
 * GET /api/v1/admin/users/:id
 * Returns full details of a specific user including their order history and most recent shipping address.
 */
export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch all orders associated with this user's email
        const orders = await Order.find({ "customer_details.email": user.email })
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
    } catch (error) {
        console.error("[Admin Users] getUserDetails error:", error);
        return res.status(500).json({ message: "Failed to fetch user details" });
    }
};
