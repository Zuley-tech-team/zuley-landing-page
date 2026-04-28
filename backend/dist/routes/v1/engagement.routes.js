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
const zod_1 = require("zod");
const validateRequest_1 = require("../../middlewares/validateRequest");
const publicRateLimit_1 = require("../../middlewares/publicRateLimit");
const contact_inquiry_model_1 = require("../../models/contact-inquiry.model");
const newsletter_subscriber_model_1 = require("../../models/newsletter-subscriber.model");
const corporate_lead_model_1 = require("../../models/corporate-lead.model");
const testimonial_model_1 = require("../../models/testimonial.model");
const router = (0, express_1.Router)();
const baseEmailSchema = zod_1.z.string().trim().email('Valid email is required');
const contactInquirySchema = zod_1.z.object({
    body: zod_1.z.object({
        full_name: zod_1.z.string().trim().min(2).max(120),
        email: baseEmailSchema,
        phone: zod_1.z.string().trim().min(10).max(20).optional(),
        inquiry_type: zod_1.z
            .enum(['general', 'product', 'order', 'personalization', 'corporate', 'complaint', 'other'])
            .default('general'),
        order_id: zod_1.z.string().trim().max(64).optional(),
        message: zod_1.z.string().trim().min(10).max(2000),
        source_page: zod_1.z.string().trim().max(80).optional(),
        website: zod_1.z.string().optional(),
    }),
});
const newsletterSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: baseEmailSchema,
        source: zod_1.z.string().trim().max(80).optional(),
        website: zod_1.z.string().optional(),
    }),
});
const corporateLeadSchema = zod_1.z.object({
    body: zod_1.z.object({
        company_name: zod_1.z.string().trim().min(2).max(150),
        contact_name: zod_1.z.string().trim().min(2).max(120),
        email: baseEmailSchema,
        phone: zod_1.z.string().trim().min(10).max(20).optional(),
        quantity: zod_1.z.number().int().positive(),
        product_type: zod_1.z
            .enum(['silver-pens', 'silver-phone-covers', 'mixed'])
            .default('mixed'),
        expected_timeline: zod_1.z.string().trim().max(120).optional(),
        message: zod_1.z.string().trim().max(2000).optional(),
        source_page: zod_1.z.string().trim().max(80).optional(),
        website: zod_1.z.string().optional(),
    }),
});
const spamPattern = /(https?:\/\/|www\.|\btelegram\b|\bcasino\b|\bloan\b)/i;
router.post('/contact', (0, publicRateLimit_1.publicRateLimit)({ windowMs: 15 * 60 * 1000, maxRequests: 8 }), (0, publicRateLimit_1.rejectHoneypot)('website'), (0, validateRequest_1.validateRequest)(contactInquirySchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        if (spamPattern.test(message)) {
            return res.status(400).json({
                success: false,
                message: 'Your message looks suspicious. Please remove links or promotional text.',
            });
        }
        const inquiry = yield contact_inquiry_model_1.ContactInquiry.create({
            full_name: req.body.full_name,
            email: req.body.email,
            phone: req.body.phone,
            inquiry_type: req.body.inquiry_type,
            order_id: req.body.order_id,
            message: req.body.message,
            source_page: req.body.source_page || 'contact',
        });
        return res.status(201).json({
            success: true,
            message: 'Thanks for contacting us. We will get back to you shortly.',
            data: { id: inquiry._id },
        });
    }
    catch (error) {
        return next(error);
    }
}));
router.post('/newsletter/subscribe', (0, publicRateLimit_1.publicRateLimit)({ windowMs: 15 * 60 * 1000, maxRequests: 12 }), (0, publicRateLimit_1.rejectHoneypot)('website'), (0, validateRequest_1.validateRequest)(newsletterSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, source } = req.body;
        const existing = yield newsletter_subscriber_model_1.NewsletterSubscriber.findOne({ email });
        if (existing) {
            if (existing.status === 'subscribed') {
                return res.json({ success: true, message: 'You are already subscribed.' });
            }
            existing.status = 'subscribed';
            existing.subscribed_at = new Date();
            existing.unsubscribed_at = undefined;
            existing.source = source || existing.source || 'footer';
            yield existing.save();
            return res.json({ success: true, message: 'Subscription re-activated successfully.' });
        }
        yield newsletter_subscriber_model_1.NewsletterSubscriber.create({
            email,
            source: source || 'footer',
        });
        return res.status(201).json({
            success: true,
            message: 'Subscribed successfully. Welcome to the Zuley newsletter.',
        });
    }
    catch (error) {
        return next(error);
    }
}));
router.post('/corporate-leads', (0, publicRateLimit_1.publicRateLimit)({ windowMs: 15 * 60 * 1000, maxRequests: 6 }), (0, publicRateLimit_1.rejectHoneypot)('website'), (0, validateRequest_1.validateRequest)(corporateLeadSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.message && spamPattern.test(req.body.message)) {
            return res.status(400).json({
                success: false,
                message: 'Your lead message looks suspicious. Please remove links or promotional text.',
            });
        }
        const lead = yield corporate_lead_model_1.CorporateLead.create({
            company_name: req.body.company_name,
            contact_name: req.body.contact_name,
            email: req.body.email,
            phone: req.body.phone,
            quantity: req.body.quantity,
            product_type: req.body.product_type,
            expected_timeline: req.body.expected_timeline,
            message: req.body.message,
            source_page: req.body.source_page || 'corporate',
        });
        return res.status(201).json({
            success: true,
            message: 'Corporate enquiry received. Our team will contact you soon.',
            data: { id: lead._id },
        });
    }
    catch (error) {
        return next(error);
    }
}));
router.get('/testimonials', (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const testimonials = yield testimonial_model_1.Testimonial.find({ is_active: true })
            .sort({ display_order: 1, createdAt: -1 })
            .limit(20)
            .lean();
        if (testimonials.length > 0) {
            return res.json({ success: true, data: testimonials });
        }
        return res.json({
            success: true,
            data: [
                {
                    name: 'Priya S.',
                    city: 'Mumbai',
                    rating: 5,
                    quote: 'The retirement pen we ordered felt deeply personal and premium. Packaging and engraving were flawless.',
                },
                {
                    name: 'Rajesh K.',
                    city: 'Bangalore',
                    rating: 5,
                    quote: 'Our corporate batch arrived on schedule and looked exceptionally polished. Great execution under tight timelines.',
                },
                {
                    name: 'Amit P.',
                    city: 'Hyderabad',
                    rating: 4,
                    quote: 'A meaningful anniversary gift that gets used every day. The engraving quality is remarkable.',
                },
            ],
        });
    }
    catch (error) {
        return next(error);
    }
}));
exports.default = router;
