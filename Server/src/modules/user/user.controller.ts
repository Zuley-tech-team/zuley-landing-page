/// <reference types="multer" />
import { Request, Response } from "express";
import "multer";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../../models/user.model";
import { Otp } from "../../models/otp.model";
import { Order } from "../../models/order.model";
import { Review } from "../../models/review.model";
import { Product } from "../../models/product.model";
import { Invoice } from "../../models/invoice.model";
import fs from "fs";
import { env } from "../../config/env.config";
import { sendOtpEmailDirect } from "../../services/email.service";
import { EmailService } from "../../services/email.service";
import { EmailType } from "../../models/email-queue.model";
import { uploadImageBuffer } from "../../services/cloudinary.service";
import { isCloudinaryConfigured } from "../../config/cloudinary.config";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

// Generate a secure 6-digit OTP
function generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
}

/**
 * POST /api/v1/user/send-otp
 * Sends a 6-digit OTP to the provided email.
 * Works for both signup and login (same flow).
 */
export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ message: "A valid email address is required." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Invalidate any existing unused OTPs for this email
        await Otp.deleteMany({ email: normalizedEmail, used: false });

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await Otp.create({
            email: normalizedEmail,
            otp,
            expires_at: expiresAt,
        });

        // Check if new user or existing
        const existingUser = await User.findOne({ email: normalizedEmail });
        const isNewUser = !existingUser;

        // Send OTP email via Resend
        await sendOtpEmailDirect(normalizedEmail, otp, isNewUser);

        return res.json({
            success: true,
            is_new_user: isNewUser,
            message: `OTP sent to ${normalizedEmail}`,
        });
    } catch (error: any) {
        console.error("[UserAuth] sendOtp error:", error);
        return res.status(500).json({ message: error.message || "Failed to send OTP. Please try again." });
    }
};

/**
 * POST /api/v1/user/verify-otp
 * Verifies the OTP, creates/finds the user, issues JWT cookie.
 */
export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find latest valid OTP
        const otpDoc = await Otp.findOne({
            email: normalizedEmail,
            used: false,
            expires_at: { $gt: new Date() },
        }).sort({ created_at: -1 });

        if (!otpDoc) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Increment attempt count
        otpDoc.attempts += 1;
        await otpDoc.save();

        if (otpDoc.attempts > MAX_OTP_ATTEMPTS) {
            await otpDoc.deleteOne();
            return res.status(429).json({ message: "Too many attempts. Please request a new OTP." });
        }

        if (otpDoc.otp !== otp) {
            const remaining = MAX_OTP_ATTEMPTS - otpDoc.attempts;
            return res.status(400).json({
                message: `Incorrect OTP. ${remaining} attempt(s) remaining.`,
            });
        }

        // Mark OTP as used
        otpDoc.used = true;
        await otpDoc.save();

        // Find or create user
        let user = await User.findOne({ email: normalizedEmail });
        const isNewUser = !user;

        if (!user) {
            user = await User.create({ email: normalizedEmail });
        }

        const loginDate = new Date();
        user.last_login = loginDate;
        if (!user.login_history) {
            user.login_history = [];
        }
        user.login_history.push(loginDate);
        await user.save();

        // Issue JWT
        const token = jwt.sign({ id: user._id }, env.JWT_SECRET, {
            expiresIn: "30d",
        });

        // Set cookie
        res.cookie("user_token", token, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return res.json({
            success: true,
            is_new_user: isNewUser,
            needs_profile: !user.is_profile_complete,
            token, // also send token for Bearer header support
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                is_profile_complete: user.is_profile_complete,
            },
        });
    } catch (error) {
        console.error("[UserAuth] verifyOtp error:", error);
        return res.status(500).json({ message: "Verification failed. Please try again." });
    }
};

/**
 * POST /api/v1/user/complete-profile
 * Updates name and phone for a newly registered user.
 */
export const completeProfile = async (req: Request, res: Response) => {
    try {
        const { name, phone } = req.body;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: "Please enter your full name." });
        }

        if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ message: "Please enter a valid 10-digit Indian mobile number." });
        }

        const user = req.user;
        user.name = name.trim();
        user.phone = phone.trim();
        user.is_profile_complete = true;
        await user.save();

        return res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                is_profile_complete: user.is_profile_complete,
            },
        });
    } catch (error) {
        console.error("[UserAuth] completeProfile error:", error);
        return res.status(500).json({ message: "Failed to update profile. Please try again." });
    }
};

/**
 * POST /api/v1/user/logout
 * Clears the auth cookie.
 */
export const logout = async (req: Request, res: Response) => {
    res.clearCookie("user_token");
    return res.json({ success: true, message: "Logged out successfully." });
};

/**
 * GET /api/v1/user/me
 * Returns the authenticated user's profile.
 */
export const getMe = async (req: Request, res: Response) => {
    const user = req.user;
    return res.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            is_profile_complete: user.is_profile_complete,
        },
    });
};

/**
 * GET /api/v1/user/orders
 * Returns all orders linked to the authenticated user's email.
 */
export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userEmail = req.user.email;

        const orders = await Order.find({
            "customer_details.email": userEmail,
        })
            .sort({ createdAt: -1 })
            .select(
                "order_id status payment_status payment_method total_amount items_count items shipping_address shipping_details createdAt customer_details return_request"
            )
            .populate({
                path: "items.product_id",
                select: "sku image",
            })
            .lean();

        const orderIds = orders.map((order: any) => order.order_id);
        const existingReviews = await Review.find({ order_id: { $in: orderIds } })
            .select("order_id product_sku status")
            .lean();

        const reviewedMap = existingReviews.reduce<Record<string, string[]>>((acc, review) => {
            if (!acc[review.order_id]) {
                acc[review.order_id] = [];
            }
            acc[review.order_id].push(review.product_sku);
            return acc;
        }, {});

        const enrichedOrders = orders.map((order: any) => ({
            ...order,
            reviewed_items: reviewedMap[order.order_id] || [],
            items: (order.items || []).map((item: any) => ({
                ...item,
                product_image: item.product_id?.image || "",
                product_sku: item.product_id?.sku || item.sku,
            })),
        }));

        return res.json({
            success: true,
            orders: enrichedOrders,
        });
    } catch (error) {
        console.error("[UserAuth] getMyOrders error:", error);
        return res.status(500).json({ message: "Failed to fetch orders." });
    }
};

/**
 * POST /api/v1/user/reviews
 * Submit a product review (delivered orders only).
 */
export const submitOrderReview = async (req: Request, res: Response) => {
    try {
        const userEmail = req.user.email;
        const { order_id, product_sku, rating, comment } = req.body || {};

        if (!order_id || !product_sku) {
            return res.status(400).json({ message: "Order ID and product are required." });
        }

        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5." });
        }

        if (!comment || !String(comment).trim()) {
            return res.status(400).json({ message: "Review text is required." });
        }

        const order = await Order.findOne({ order_id, "customer_details.email": userEmail }).lean();
        if (!order) {
            return res.status(404).json({ message: "Order not found or unauthorized." });
        }

        if (order.status !== "delivered") {
            return res.status(400).json({ message: "Reviews can be submitted only after delivery." });
        }

        const matchingItem = (order.items || []).find((item: any) => item.sku === product_sku);
        if (!matchingItem) {
            return res.status(400).json({ message: "Product not found in this order." });
        }

        const existingReview = await Review.findOne({ order_id, product_sku });
        if (existingReview) {
            return res.status(400).json({ message: "A review has already been submitted for this product." });
        }

        const files = (req.files as any[]) || [];
        let uploadedImages: Array<{ url: string; public_id: string }> = [];

        if (files.length > 0) {
            if (!isCloudinaryConfigured()) {
                return res.status(400).json({ message: "Image uploads are unavailable. Please submit without photos." });
            }

            const uploadResults = await Promise.all(
                files.map((file) =>
                    uploadImageBuffer(file.buffer, {
                        folder: "zuley/reviews",
                    })
                )
            );
            uploadedImages = uploadResults.map(res => ({
                url: res.secure_url,
                public_id: res.public_id
            }));
        }

        const productDoc = await Product.findOne({ sku: product_sku }).select("name image").lean();

        const review = await Review.create({
            order_id,
            order_ref: order._id,
            product_sku,
            product_name: productDoc?.name || matchingItem.name,
            product_image: productDoc?.image || "",
            customer_name: order.customer_details?.name || "Customer",
            customer_email: userEmail,
            customer_city: order.shipping_address?.city || "",
            rating: numericRating,
            comment: String(comment).trim(),
            images: uploadedImages,
            status: "pending",
        });

        return res.status(201).json({ success: true, data: review });
    } catch (error: any) {
        console.error("[UserAuth] submitOrderReview error:", error);
        if (error?.code === 11000) {
            return res.status(400).json({ message: "A review has already been submitted for this product." });
        }
        return res.status(500).json({ message: error?.message || "Failed to submit review." });
    }
};

/**
 * GET /api/v1/user/orders/:id/invoice
 * Downloads the invoice for a specific order.
 */
export const downloadMyInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        const order = await Order.findOne({ order_id: id, "customer_details.email": userEmail });
        if (!order) {
            return res.status(404).json({ message: "Order not found or unauthorized." });
        }

        const invoice = await Invoice.findOne({ orderId: order._id });
        if (!invoice || !invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
            return res.status(404).json({ message: "Invoice PDF not available for this order." });
        }

        res.download(invoice.pdfPath, `Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
        console.error("[UserAuth] downloadMyInvoice error:", error);
        return res.status(500).json({ message: "Failed to download invoice." });
    }
};

/**
 * POST /api/v1/user/orders/:id/return-request
 * Submit a return/refund request within 48 hours of delivery.
 */
export const submitReturnRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { type, reason, note } = req.body || {};
        const userEmail = req.user.email;

        if (!type || !['refund', 'replace'].includes(type)) {
            return res.status(400).json({ message: "Return type must be refund or replace." });
        }

        if (!reason || !String(reason).trim()) {
            return res.status(400).json({ message: "Return reason is required." });
        }

        if (!note || !String(note).trim()) {
            return res.status(400).json({ message: "A note is required for the return request." });
        }

        const order = await Order.findOne({ order_id: id, "customer_details.email": userEmail });
        if (!order) {
            return res.status(404).json({ message: "Order not found or unauthorized." });
        }

        if (order.status !== "delivered") {
            return res.status(400).json({ message: "Returns are available only after delivery." });
        }

        const deliveredAt = order.shipping_details?.delivered_at;
        if (!deliveredAt) {
            return res.status(400).json({ message: "Delivery time not available for this order." });
        }

        const cutoff = new Date(deliveredAt.getTime() + 48 * 60 * 60 * 1000);
        if (new Date() > cutoff) {
            return res.status(400).json({ message: "Return window expired. Requests are valid for 48 hours after delivery." });
        }

        if (order.return_request?.status && order.return_request.status !== "rejected") {
            return res.status(400).json({ message: "A return request is already in progress for this order." });
        }

        order.return_request = {
            type,
            reason: String(reason).trim(),
            note: String(note).trim(),
            status: "requested",
            requested_at: new Date(),
        } as any;

        order.status = "return_requested";
        order.history.push({
            status: "return_requested",
            changed_by: "customer",
            reason: `${type} requested: ${String(reason).trim()}`,
            timestamp: new Date(),
        });

        await order.save();

        if (order.customer_details?.email) {
            await EmailService.addToQueue(
                EmailType.RETURN_REQUESTED,
                order.customer_details.email,
                order._id,
                {
                    orderId: order.order_id,
                    customerName: order.customer_details?.name || "Customer",
                    type,
                    reason: String(reason).trim(),
                }
            );
        }

        return res.json({ success: true, data: order });
    } catch (error) {
        console.error("[UserAuth] submitReturnRequest error:", error);
        return res.status(500).json({ message: "Failed to submit return request." });
    }
};
