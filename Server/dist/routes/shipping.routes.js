"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shipping_controller_1 = require("../controllers/shipping.controller");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = express_1.default.Router();
router.use(admin_middleware_1.authenticateAdmin);
router.post('/ship', shipping_controller_1.ShippingController.shipOrder);
router.post('/update', shipping_controller_1.ShippingController.updateTracking);
router.post('/deliver', shipping_controller_1.ShippingController.markDelivered);
exports.default = router;
