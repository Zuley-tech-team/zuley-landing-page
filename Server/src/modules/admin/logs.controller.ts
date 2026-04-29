import { Request, Response } from "express";
import { AdminLog } from "../../models/admin-log.model";

export const getSystemLogs = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 50, type, admin_id } = req.query;

        const query: any = {};

        if (type) {
            query.target_type = type;
        }

        if (admin_id) {
            query.admin_id = admin_id;
        }

        const logs = await AdminLog.find(query)
            .populate('admin_id', 'name email')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await AdminLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
            pagination: {
                current: Number(page),
                total: Math.ceil(total / Number(limit)),
                count: total,
            }
        });

    } catch (error) {
        console.error("Get Logs Error:", error);
        res.status(500).json({ message: "Failed to fetch logs" });
    }
};
