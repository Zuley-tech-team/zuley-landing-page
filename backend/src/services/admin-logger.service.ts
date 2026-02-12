import { AdminLog } from "../models/admin-log.model";
import { Request } from "express";

export class AdminLogger {
    /**
     * Log an admin action
     */
    static async logAction(
        adminId: any,
        action: string,
        targetType: string,
        targetId: string | undefined,
        details: any,
        req?: Request
    ) {
        try {
            // Extract IP from request if available
            const ipAddress = req
                ? (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress
                : "unknown";

            await AdminLog.create({
                admin_id: adminId,
                action,
                target_type: targetType,
                target_id: targetId,
                details,
                ip_address: ipAddress,
            });
        } catch (error) {
            console.error("Failed to write admin log:", error);
            // Non-blocking, don't throw
        }
    }
}
