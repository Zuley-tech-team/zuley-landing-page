import { Router } from "express";
import multer from "multer";
import { authenticateUser } from "../../middlewares/user.middleware";
import { publicRateLimit } from "../../middlewares/publicRateLimit";
import * as userController from "./user.controller";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

// Public Routes — rate limited
router.post(
    "/send-otp",
    publicRateLimit({ windowMs: 5 * 60 * 1000, maxRequests: 5 }), // 5 per 5 min
    userController.sendOtp
);

router.post(
    "/verify-otp",
    publicRateLimit({ windowMs: 5 * 60 * 1000, maxRequests: 10 }),
    userController.verifyOtp
);

router.post("/logout", userController.logout);

// Protected Routes
router.use(authenticateUser);

router.get("/me", userController.getMe);
router.patch("/complete-profile", userController.completeProfile);
router.get("/orders", userController.getMyOrders);
router.get("/orders/:id/invoice/download", userController.downloadMyInvoice);
router.post("/orders/:id/return-request", userController.submitReturnRequest);
router.post("/reviews", upload.array("images", 5), userController.submitOrderReview);

export default router;
