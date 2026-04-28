import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middlewares/validateRequest';
import { publicRateLimit, rejectHoneypot } from '../../middlewares/publicRateLimit';
import { ContactInquiry } from '../../models/contact-inquiry.model';
import { NewsletterSubscriber } from '../../models/newsletter-subscriber.model';
import { CorporateLead } from '../../models/corporate-lead.model';
import { Testimonial } from '../../models/testimonial.model';

const router = Router();

const baseEmailSchema = z.string().trim().email('Valid email is required');

const contactInquirySchema = z.object({
  body: z.object({
    full_name: z.string().trim().min(2).max(120),
    email: baseEmailSchema,
    phone: z.string().trim().min(10).max(20).optional(),
    inquiry_type: z
      .enum(['general', 'product', 'order', 'personalization', 'corporate', 'complaint', 'other'])
      .default('general'),
    order_id: z.string().trim().max(64).optional(),
    message: z.string().trim().min(10).max(2000),
    source_page: z.string().trim().max(80).optional(),
    website: z.string().optional(),
  }),
});

const newsletterSchema = z.object({
  body: z.object({
    email: baseEmailSchema,
    source: z.string().trim().max(80).optional(),
    website: z.string().optional(),
  }),
});

const corporateLeadSchema = z.object({
  body: z.object({
    company_name: z.string().trim().min(2).max(150),
    contact_name: z.string().trim().min(2).max(120),
    email: baseEmailSchema,
    phone: z.string().trim().min(10).max(20).optional(),
    quantity: z.number().int().positive(),
    product_type: z
      .enum(['silver-pens', 'silver-phone-covers', 'mixed'])
      .default('mixed'),
    expected_timeline: z.string().trim().max(120).optional(),
    message: z.string().trim().max(2000).optional(),
    source_page: z.string().trim().max(80).optional(),
    website: z.string().optional(),
  }),
});

const spamPattern = /(https?:\/\/|www\.|\btelegram\b|\bcasino\b|\bloan\b)/i;

router.post(
  '/contact',
  publicRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 8 }),
  rejectHoneypot('website'),
  validateRequest(contactInquirySchema),
  async (req, res, next) => {
    try {
      const { message } = req.body;

      if (spamPattern.test(message)) {
        return res.status(400).json({
          success: false,
          message: 'Your message looks suspicious. Please remove links or promotional text.',
        });
      }

      const inquiry = await ContactInquiry.create({
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
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  '/newsletter/subscribe',
  publicRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 12 }),
  rejectHoneypot('website'),
  validateRequest(newsletterSchema),
  async (req, res, next) => {
    try {
      const { email, source } = req.body;

      const existing = await NewsletterSubscriber.findOne({ email });
      if (existing) {
        if (existing.status === 'subscribed') {
          return res.json({ success: true, message: 'You are already subscribed.' });
        }

        existing.status = 'subscribed';
        existing.subscribed_at = new Date();
        existing.unsubscribed_at = undefined;
        existing.source = source || existing.source || 'footer';
        await existing.save();

        return res.json({ success: true, message: 'Subscription re-activated successfully.' });
      }

      await NewsletterSubscriber.create({
        email,
        source: source || 'footer',
      });

      return res.status(201).json({
        success: true,
        message: 'Subscribed successfully. Welcome to the Zuley newsletter.',
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  '/corporate-leads',
  publicRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 6 }),
  rejectHoneypot('website'),
  validateRequest(corporateLeadSchema),
  async (req, res, next) => {
    try {
      if (req.body.message && spamPattern.test(req.body.message)) {
        return res.status(400).json({
          success: false,
          message: 'Your lead message looks suspicious. Please remove links or promotional text.',
        });
      }

      const lead = await CorporateLead.create({
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
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/testimonials', async (_req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ is_active: true })
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
          quote:
            'The retirement pen we ordered felt deeply personal and premium. Packaging and engraving were flawless.',
        },
        {
          name: 'Rajesh K.',
          city: 'Bangalore',
          rating: 5,
          quote:
            'Our corporate batch arrived on schedule and looked exceptionally polished. Great execution under tight timelines.',
        },
        {
          name: 'Amit P.',
          city: 'Hyderabad',
          rating: 4,
          quote:
            'A meaningful anniversary gift that gets used every day. The engraving quality is remarkable.',
        },
      ],
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
