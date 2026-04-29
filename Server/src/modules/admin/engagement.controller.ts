import { Request, Response } from "express";
import { ContactInquiry } from "../../models/contact-inquiry.model";
import { CorporateLead } from "../../models/corporate-lead.model";
import { NewsletterSubscriber } from "../../models/newsletter-subscriber.model";
import { User } from "../../models/user.model";
import { AdminLogger } from "../../services/admin-logger.service";

const paginationOptions = (req: Request) => {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    return { page, limit, skip: (page - 1) * limit };
};

export const getContactInquiries = async (req: Request, res: Response) => {
    try {
        const { page, limit, skip } = paginationOptions(req);
        const { status, search } = req.query;
        const query: any = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            const regex = new RegExp(String(search), "i");
            query.$or = [
                { full_name: regex },
                { email: regex },
                { phone: regex },
                { inquiry_type: regex },
                { order_id: regex },
                { message: regex },
            ];
        }

        const [items, total] = await Promise.all([
            ContactInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            ContactInquiry.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: items,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: total,
            },
        });
    } catch (error) {
        console.error("Get Contact Inquiries Error:", error);
        res.status(500).json({ message: "Failed to fetch contact inquiries" });
    }
};

export const updateContactInquiryStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ["new", "in_progress", "resolved"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const inquiry = await ContactInquiry.findByIdAndUpdate(id, { status }, { new: true });
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }

        await AdminLogger.logAction(req.admin._id, "UPDATE_CONTACT_STATUS", "contact_inquiry", id, { status }, req);

        res.json({ success: true, data: inquiry });
    } catch (error) {
        console.error("Update Contact Inquiry Error:", error);
        res.status(500).json({ message: "Failed to update contact inquiry" });
    }
};

export const getCorporateLeads = async (req: Request, res: Response) => {
    try {
        const { page, limit, skip } = paginationOptions(req);
        const { status, search } = req.query;
        const query: any = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            const regex = new RegExp(String(search), "i");
            query.$or = [
                { company_name: regex },
                { contact_name: regex },
                { email: regex },
                { phone: regex },
                { product_type: regex },
                { message: regex },
            ];
        }

        const [items, total] = await Promise.all([
            CorporateLead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            CorporateLead.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: items,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: total,
            },
        });
    } catch (error) {
        console.error("Get Corporate Leads Error:", error);
        res.status(500).json({ message: "Failed to fetch corporate leads" });
    }
};

export const updateCorporateLeadStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ["new", "contacted", "qualified", "closed"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const lead = await CorporateLead.findByIdAndUpdate(id, { status }, { new: true });
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        await AdminLogger.logAction(req.admin._id, "UPDATE_CORPORATE_LEAD_STATUS", "corporate_lead", id, { status }, req);

        res.json({ success: true, data: lead });
    } catch (error) {
        console.error("Update Corporate Lead Error:", error);
        res.status(500).json({ message: "Failed to update corporate lead" });
    }
};

export const getNewsletterSubscribers = async (req: Request, res: Response) => {
    try {
        const { page, limit, skip } = paginationOptions(req);
        const { status, search } = req.query;
        const query: any = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            query.email = new RegExp(String(search), "i");
        }

        const [items, total] = await Promise.all([
            NewsletterSubscriber.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            NewsletterSubscriber.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: items,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: total,
            },
        });
    } catch (error) {
        console.error("Get Newsletter Subscribers Error:", error);
        res.status(500).json({ message: "Failed to fetch newsletter subscribers" });
    }
};

export const getEngagementStats = async (_req: Request, res: Response) => {
    try {
        const [newContacts, openCorporate, subscribers, totalUsers] = await Promise.all([
            ContactInquiry.countDocuments({ status: { $ne: "resolved" } }),
            CorporateLead.countDocuments({ status: { $ne: "closed" } }),
            NewsletterSubscriber.countDocuments({ status: "subscribed" }),
            User.countDocuments(),
        ]);

        res.json({
            success: true,
            data: {
                openContactInquiries: newContacts,
                openCorporateLeads: openCorporate,
                activeSubscribers: subscribers,
                totalUsers: totalUsers,
            },
        });
    } catch (error) {
        console.error("Get Engagement Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch engagement stats" });
    }
};
