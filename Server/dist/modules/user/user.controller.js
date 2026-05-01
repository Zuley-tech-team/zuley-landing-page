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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitReturnRequest = exports.downloadMyInvoice = exports.submitOrderReview = exports.getMyOrders = exports.getMe = exports.logout = exports.completeProfile = exports.verifyOtp = exports.sendOtp = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../../models/user.model");
const otp_model_1 = require("../../models/otp.model");
const order_model_1 = require("../../models/order.model");
const review_model_1 = require("../../models/review.model");
const product_model_1 = require("../../models/product.model");
const invoice_model_1 = require("../../models/invoice.model");
const fs_1 = __importDefault(require("fs"));
const env_config_1 = require("../../config/env.config");
const email_service_1 = require("../../services/email.service");
const email_service_2 = require("../../services/email.service");
const email_queue_model_1 = require("../../models/email-queue.model");
const cloudinary_service_1 = require("../../services/cloudinary.service");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
// Generate a secure 6-digit OTP
function generateOtp() {
    return crypto_1.default.randomInt(100000, 999999).toString();
}
/**
 * POST /api/v1/user/send-otp
 * Sends a 6-digit OTP to the provided email.
 * Works for both signup and login (same flow).
 */
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ message: "A valid email address is required." });
        }
        const normalizedEmail = email.toLowerCase().trim();
        // Invalidate any existing unused OTPs for this email
        yield otp_model_1.Otp.deleteMany({ email: normalizedEmail, used: false });
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        yield otp_model_1.Otp.create({
            email: normalizedEmail,
            otp,
            expires_at: expiresAt,
        });
        // Check if new user or existing
        const existingUser = yield user_model_1.User.findOne({ email: normalizedEmail });
        const isNewUser = !existingUser;
        // Send OTP email via Resend
        yield (0, email_service_1.sendOtpEmailDirect)(normalizedEmail, otp, isNewUser);
        return res.json({
            success: true,
            is_new_user: isNewUser,
            message: `OTP sent to ${normalizedEmail}`,
        });
    }
    catch (error) {
        console.error("[UserAuth] sendOtp error:", error);
        return res.status(500).json({ message: error.message || "Failed to send OTP. Please try again." });
    }
});
exports.sendOtp = sendOtp;
/**
 * POST /api/v1/user/verify-otp
 * Verifies the OTP, creates/finds the user, issues JWT cookie.
 */
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }
        const normalizedEmail = email.toLowerCase().trim();
        // Find latest valid OTP
        const otpDoc = yield otp_model_1.Otp.findOne({
            email: normalizedEmail,
            used: false,
            expires_at: { $gt: new Date() },
        }).sort({ created_at: -1 });
        if (!otpDoc) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }
        // Increment attempt count
        otpDoc.attempts += 1;
        yield otpDoc.save();
        if (otpDoc.attempts > MAX_OTP_ATTEMPTS) {
            yield otpDoc.deleteOne();
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
        yield otpDoc.save();
        // Find or create user
        let user = yield user_model_1.User.findOne({ email: normalizedEmail });
        const isNewUser = !user;
        if (!user) {
            user = yield user_model_1.User.create({ email: normalizedEmail });
        }
        const loginDate = new Date();
        user.last_login = loginDate;
        if (!user.login_history) {
            user.login_history = [];
        }
        user.login_history.push(loginDate);
        yield user.save();
        // Issue JWT
        const token = jsonwebtoken_1.default.sign({ id: user._id }, env_config_1.env.JWT_SECRET, {
            expiresIn: "30d",
        });
        // Set cookie
        res.cookie("user_token", token, {
            httpOnly: true,
            secure: env_config_1.env.NODE_ENV === "production",
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
    }
    catch (error) {
        console.error("[UserAuth] verifyOtp error:", error);
        return res.status(500).json({ message: "Verification failed. Please try again." });
    }
});
exports.verifyOtp = verifyOtp;
/**
 * POST /api/v1/user/complete-profile
 * Updates name and phone for a newly registered user.
 */
const completeProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield user.save();
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
    }
    catch (error) {
        console.error("[UserAuth] completeProfile error:", error);
        return res.status(500).json({ message: "Failed to update profile. Please try again." });
    }
});
exports.completeProfile = completeProfile;
/**
 * POST /api/v1/user/logout
 * Clears the auth cookie.
 */
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("user_token");
    return res.json({ success: true, message: "Logged out successfully." });
});
exports.logout = logout;
/**
 * GET /api/v1/user/me
 * Returns the authenticated user's profile.
 */
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.getMe = getMe;
/**
 * GET /api/v1/user/orders
 * Returns all orders linked to the authenticated user's email.
 */
const getMyOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = req.user.email;
        const orders = yield order_model_1.Order.find({
            "customer_details.email": userEmail,
        })
            .sort({ createdAt: -1 })
            .select("order_id status payment_status payment_method total_amount items_count items shipping_address shipping_details createdAt customer_details return_request")
            .populate({
            path: "items.product_id",
            select: "sku image",
        })
            .lean();
        const orderIds = orders.map((order) => order.order_id);
        const existingReviews = yield review_model_1.Review.find({ order_id: { $in: orderIds } })
            .select("order_id product_sku status")
            .lean();
        const reviewedMap = existingReviews.reduce((acc, review) => {
            if (!acc[review.order_id]) {
                acc[review.order_id] = [];
            }
            acc[review.order_id].push(review.product_sku);
            return acc;
        }, {});
        const enrichedOrders = orders.map((order) => (Object.assign(Object.assign({}, order), { reviewed_items: reviewedMap[order.order_id] || [], items: (order.items || []).map((item) => {
                var _a, _b;
                return (Object.assign(Object.assign({}, item), { product_image: ((_a = item.product_id) === null || _a === void 0 ? void 0 : _a.image) || "", product_sku: ((_b = item.product_id) === null || _b === void 0 ? void 0 : _b.sku) || item.sku }));
            }) })));
        return res.json({
            success: true,
            orders: enrichedOrders,
        });
    }
    catch (error) {
        console.error("[UserAuth] getMyOrders error:", error);
        return res.status(500).json({ message: "Failed to fetch orders." });
    }
});
exports.getMyOrders = getMyOrders;
/**
 * POST /api/v1/user/reviews
 * Submit a product review (delivered orders only).
 */
const submitOrderReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        const order = yield order_model_1.Order.findOne({ order_id, "customer_details.email": userEmail }).lean();
        if (!order) {
            return res.status(404).json({ message: "Order not found or unauthorized." });
        }
        if (order.status !== "delivered") {
            return res.status(400).json({ message: "Reviews can be submitted only after delivery." });
        }
        const matchingItem = (order.items || []).find((item) => item.sku === product_sku);
        if (!matchingItem) {
            return res.status(400).json({ message: "Product not found in this order." });
        }
        const existingReview = yield review_model_1.Review.findOne({ order_id, product_sku });
        if (existingReview) {
            return res.status(400).json({ message: "A review has already been submitted for this product." });
        }
        const files = req.files || [];
        let uploadedImages = [];
        if (files.length > 0) {
            if (!(0, cloudinary_config_1.isCloudinaryConfigured)()) {
                return res.status(400).json({ message: "Image uploads are unavailable. Please submit without photos." });
            }
            const uploadResults = yield Promise.all(files.map((file) => (0, cloudinary_service_1.uploadImageBuffer)(file.buffer, {
                folder: "zuley/reviews",
            })));
            uploadedImages = uploadResults.map(res => ({
                url: res.secure_url,
                public_id: res.public_id
            }));
        }
        const productDoc = yield product_model_1.Product.findOne({ sku: product_sku }).select("name image").lean();
        const review = yield review_model_1.Review.create({
            order_id,
            order_ref: order._id,
            product_sku,
            product_name: (productDoc === null || productDoc === void 0 ? void 0 : productDoc.name) || matchingItem.name,
            product_image: (productDoc === null || productDoc === void 0 ? void 0 : productDoc.image) || "",
            customer_name: ((_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.name) || "Customer",
            customer_email: userEmail,
            customer_city: ((_b = order.shipping_address) === null || _b === void 0 ? void 0 : _b.city) || "",
            rating: numericRating,
            comment: String(comment).trim(),
            images: uploadedImages,
            status: "pending",
        });
        return res.status(201).json({ success: true, data: review });
    }
    catch (error) {
        console.error("[UserAuth] submitOrderReview error:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return res.status(400).json({ message: "A review has already been submitted for this product." });
        }
        return res.status(500).json({ message: (error === null || error === void 0 ? void 0 : error.message) || "Failed to submit review." });
    }
});
exports.submitOrderReview = submitOrderReview;
/**
 * GET /api/v1/user/orders/:id/invoice
 * Downloads the invoice for a specific order.
 */
const downloadMyInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;
        const order = yield order_model_1.Order.findOne({ order_id: id, "customer_details.email": userEmail });
        if (!order) {
            return res.status(404).json({ message: "Order not found or unauthorized." });
        }
        const invoice = yield invoice_model_1.Invoice.findOne({ orderId: order._id });
        if (!invoice || !invoice.pdfPath || !fs_1.default.existsSync(invoice.pdfPath)) {
            return res.status(404).json({ message: "Invoice PDF not available for this order." });
        }
        res.download(invoice.pdfPath, `Invoice-${invoice.invoiceNumber}.pdf`);
    }
    catch (error) {
        console.error("[UserAuth] downloadMyInvoice error:", error);
        return res.status(500).json({ message: "Failed to download invoice." });
    }
});
exports.downloadMyInvoice = downloadMyInvoice;
/**
 * POST /api/v1/user/orders/:id/return-request
 * Submit a return/refund request within 48 hours of delivery.
 */
const submitReturnRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
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
        const order = yield order_model_1.Order.findOne({ order_id: id, "customer_details.email": userEmail });
        if (!order) {
            return res.status(404).json({ message: "Order not found or unauthorized." });
        }
        if (order.status !== "delivered") {
            return res.status(400).json({ message: "Returns are available only after delivery." });
        }
        const deliveredAt = (_a = order.shipping_details) === null || _a === void 0 ? void 0 : _a.delivered_at;
        if (!deliveredAt) {
            return res.status(400).json({ message: "Delivery time not available for this order." });
        }
        const cutoff = new Date(deliveredAt.getTime() + 48 * 60 * 60 * 1000);
        if (new Date() > cutoff) {
            return res.status(400).json({ message: "Return window expired. Requests are valid for 48 hours after delivery." });
        }
        if (((_b = order.return_request) === null || _b === void 0 ? void 0 : _b.status) && order.return_request.status !== "rejected") {
            return res.status(400).json({ message: "A return request is already in progress for this order." });
        }
        order.return_request = {
            type,
            reason: String(reason).trim(),
            note: String(note).trim(),
            status: "requested",
            requested_at: new Date(),
        };
        order.status = "return_requested";
        order.history.push({
            status: "return_requested",
            changed_by: "customer",
            reason: `${type} requested: ${String(reason).trim()}`,
            timestamp: new Date(),
        });
        yield order.save();
        if ((_c = order.customer_details) === null || _c === void 0 ? void 0 : _c.email) {
            yield email_service_2.EmailService.addToQueue(email_queue_model_1.EmailType.RETURN_REQUESTED, order.customer_details.email, order._id, {
                orderId: order.order_id,
                customerName: ((_d = order.customer_details) === null || _d === void 0 ? void 0 : _d.name) || "Customer",
                type,
                reason: String(reason).trim(),
            });
        }
        return res.json({ success: true, data: order });
    }
    catch (error) {
        console.error("[UserAuth] submitReturnRequest error:", error);
        return res.status(500).json({ message: "Failed to submit return request." });
    }
});
exports.submitReturnRequest = submitReturnRequest;
