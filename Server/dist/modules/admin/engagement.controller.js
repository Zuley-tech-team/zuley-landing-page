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
exports.getEngagementStats = exports.getNewsletterSubscribers = exports.updateCorporateLeadStatus = exports.getCorporateLeads = exports.updateContactInquiryStatus = exports.getContactInquiries = void 0;
const contact_inquiry_model_1 = require("../../models/contact-inquiry.model");
const corporate_lead_model_1 = require("../../models/corporate-lead.model");
const newsletter_subscriber_model_1 = require("../../models/newsletter-subscriber.model");
const user_model_1 = require("../../models/user.model");
const admin_logger_service_1 = require("../../services/admin-logger.service");
const paginationOptions = (req) => {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    return { page, limit, skip: (page - 1) * limit };
};
const getContactInquiries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = paginationOptions(req);
        const { status, search } = req.query;
        const query = {};
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
        const [items, total] = yield Promise.all([
            contact_inquiry_model_1.ContactInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            contact_inquiry_model_1.ContactInquiry.countDocuments(query),
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
    }
    catch (error) {
        console.error("Get Contact Inquiries Error:", error);
        res.status(500).json({ message: "Failed to fetch contact inquiries" });
    }
});
exports.getContactInquiries = getContactInquiries;
const updateContactInquiryStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ["new", "in_progress", "resolved"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const inquiry = yield contact_inquiry_model_1.ContactInquiry.findByIdAndUpdate(id, { status }, { new: true });
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        yield admin_logger_service_1.AdminLogger.logAction(req.admin._id, "UPDATE_CONTACT_STATUS", "contact_inquiry", id, { status }, req);
        res.json({ success: true, data: inquiry });
    }
    catch (error) {
        console.error("Update Contact Inquiry Error:", error);
        res.status(500).json({ message: "Failed to update contact inquiry" });
    }
});
exports.updateContactInquiryStatus = updateContactInquiryStatus;
const getCorporateLeads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = paginationOptions(req);
        const { status, search } = req.query;
        const query = {};
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
        const [items, total] = yield Promise.all([
            corporate_lead_model_1.CorporateLead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            corporate_lead_model_1.CorporateLead.countDocuments(query),
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
    }
    catch (error) {
        console.error("Get Corporate Leads Error:", error);
        res.status(500).json({ message: "Failed to fetch corporate leads" });
    }
});
exports.getCorporateLeads = getCorporateLeads;
const updateCorporateLeadStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ["new", "contacted", "qualified", "closed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const lead = yield corporate_lead_model_1.CorporateLead.findByIdAndUpdate(id, { status }, { new: true });
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        yield admin_logger_service_1.AdminLogger.logAction(req.admin._id, "UPDATE_CORPORATE_LEAD_STATUS", "corporate_lead", id, { status }, req);
        res.json({ success: true, data: lead });
    }
    catch (error) {
        console.error("Update Corporate Lead Error:", error);
        res.status(500).json({ message: "Failed to update corporate lead" });
    }
});
exports.updateCorporateLeadStatus = updateCorporateLeadStatus;
const getNewsletterSubscribers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = paginationOptions(req);
        const { status, search } = req.query;
        const query = {};
        if (status && status !== "all") {
            query.status = status;
        }
        if (search) {
            query.email = new RegExp(String(search), "i");
        }
        const [items, total] = yield Promise.all([
            newsletter_subscriber_model_1.NewsletterSubscriber.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            newsletter_subscriber_model_1.NewsletterSubscriber.countDocuments(query),
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
    }
    catch (error) {
        console.error("Get Newsletter Subscribers Error:", error);
        res.status(500).json({ message: "Failed to fetch newsletter subscribers" });
    }
});
exports.getNewsletterSubscribers = getNewsletterSubscribers;
const getEngagementStats = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [newContacts, openCorporate, subscribers, totalUsers] = yield Promise.all([
            contact_inquiry_model_1.ContactInquiry.countDocuments({ status: { $ne: "resolved" } }),
            corporate_lead_model_1.CorporateLead.countDocuments({ status: { $ne: "closed" } }),
            newsletter_subscriber_model_1.NewsletterSubscriber.countDocuments({ status: "subscribed" }),
            user_model_1.User.countDocuments(),
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
    }
    catch (error) {
        console.error("Get Engagement Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch engagement stats" });
    }
});
exports.getEngagementStats = getEngagementStats;
