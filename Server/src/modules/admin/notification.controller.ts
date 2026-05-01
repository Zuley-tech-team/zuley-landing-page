import { Request, Response } from "express";
import { Order } from "../../models/order.model";
import { Review } from "../../models/review.model";
import { Product } from "../../models/product.model";
import { Inventory } from "../../models/inventory.model";
import { CorporateLead } from "../../models/corporate-lead.model";
import { ContactInquiry } from "../../models/contact-inquiry.model";
import { NewsletterSubscriber } from "../../models/newsletter-subscriber.model";
import { Coupon } from "../../models/coupon.model";
import { Admin } from "../../models/admin.model";

export const getNotificationCounts = async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).admin.id;
        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const lastViewed = admin.notification_last_viewed || {
            dashboard: new Date(0),
            products: new Date(0),
            orders: new Date(0),
            reviews: new Date(0),
            inventory: new Date(0),
            leads: new Date(0),
            coupons: new Date(0)
        };

        // Helper to get date safely
        const getDate = (d: any) => d instanceof Date ? d : new Date(0);

        // 1. Orders: New orders OR status changes
        const ordersCount = await Order.countDocuments({
            updatedAt: { $gt: getDate(lastViewed.orders) }
        });

        // 2. Reviews: New reviews
        const reviewsCount = await Review.countDocuments({
            createdAt: { $gt: getDate(lastViewed.reviews) }
        });

        // 3. Inventory: New low stock warnings since last view
        const totalInventoryWarnings = await Inventory.countDocuments({
            $or: [
                { quantity: { $lte: 0 } },
                { $expr: { $lte: ["$quantity", "$low_stock_threshold"] } }
            ],
            last_updated: { $gt: getDate(lastViewed.inventory) }
        });

        // 4. Leads: Combined corporate, contact, and newsletter
        const leadDate = getDate(lastViewed.leads);
        const [corpLeads, contactInqs, newsletterSub] = await Promise.all([
            CorporateLead.countDocuments({ createdAt: { $gt: leadDate } }),
            ContactInquiry.countDocuments({ createdAt: { $gt: leadDate } }),
            NewsletterSubscriber.countDocuments({ createdAt: { $gt: leadDate } })
        ]);
        const leadsCount = corpLeads + contactInqs + newsletterSub;

        // 5. Products: New products
        const productsCount = await Product.countDocuments({
            createdAt: { $gt: getDate(lastViewed.products) }
        });

        // 6. Coupons: New coupons
        const couponsCount = await Coupon.countDocuments({
            createdAt: { $gt: getDate(lastViewed.coupons) }
        });

        res.json({
            success: true,
            data: {
                dashboard: 0,
                products: productsCount,
                orders: ordersCount,
                reviews: reviewsCount,
                inventory: totalInventoryWarnings,
                leads: leadsCount,
                coupons: couponsCount
            }
        });
    } catch (error) {
        console.error("Error fetching notification counts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).admin.id;
        const { category } = req.body;

        if (!category) {
            return res.status(400).json({ message: "Category is required" });
        }

        const validCategories = ["dashboard", "products", "orders", "reviews", "inventory", "leads", "coupons"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        const updateField = `notification_last_viewed.${category}`;
        await Admin.findByIdAndUpdate(adminId, {
            $set: { [updateField]: new Date() }
        });

        res.json({ status: "success" });
    } catch (error) {
        console.error("Error marking category as read:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
