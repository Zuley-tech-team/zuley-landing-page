import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticateAdmin } from "../../middlewares/admin.middleware";

const router = Router();

// Public Routes
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Protected Routes
router.use(authenticateAdmin);

router.get("/me", authController.getMe);

// Order Routes
import * as orderController from "./order.controller";
router.get("/orders", orderController.getOrders);
router.get("/orders/:id", orderController.getOrderById);
router.put("/orders/:id/status", orderController.updateOrderStatus);

// Inventory Routes
import * as inventoryController from "./inventory.controller";
router.get("/inventory", inventoryController.getInventory);
router.post("/inventory/stock", inventoryController.updateStock);

// Logs Routes
import * as logsController from "./logs.controller";
router.get("/logs", logsController.getSystemLogs);

export default router;
