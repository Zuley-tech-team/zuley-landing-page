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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingController = void 0;
const shipping_service_1 = require("../services/shipping.service");
class ShippingController {
    /**
     * Mark an order as shipped (create shipment)
     * POST /api/v1/shipping/ship
     * Body: { orderId, courierName, trackingNumber, trackingUrl, notes }
     */
    static shipOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { orderId, courierName, trackingNumber, trackingUrl, notes } = req.body;
                if (!orderId || !courierName || !trackingNumber) {
                    return res.status(400).json({ status: false, error: 'Missing required fields' });
                }
                const shipment = yield shipping_service_1.ShippingService.createShipment(orderId, courierName, trackingNumber, trackingUrl, notes);
                return res.status(200).json({ status: true, data: shipment });
            }
            catch (error) {
                console.error('Ship Order Error:', error);
                return res.status(500).json({ status: false, error: error.message || 'Internal Server Error' });
            }
        });
    }
    /**
     * Update tracking details
     * POST /api/v1/shipping/update
     * Body: { orderId, courierName, trackingNumber, trackingUrl, status, notes }
     */
    static updateTracking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.body, { orderId } = _a, updates = __rest(_a, ["orderId"]);
                if (!orderId) {
                    return res.status(400).json({ status: false, error: 'Order ID required' });
                }
                const shipment = yield shipping_service_1.ShippingService.updateTracking(orderId, updates);
                return res.status(200).json({ status: true, data: shipment });
            }
            catch (error) {
                console.error('Update Tracking Error:', error);
                return res.status(500).json({ status: false, error: error.message });
            }
        });
    }
    /**
     * Mark shipment as delivered
     * POST /api/v1/shipping/deliver
     * Body: { orderId, notes }
     */
    static markDelivered(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { orderId, notes } = req.body;
                if (!orderId) {
                    return res.status(400).json({ status: false, error: 'Order ID required' });
                }
                const shipment = yield shipping_service_1.ShippingService.markDelivered(orderId, notes);
                return res.status(200).json({ status: true, data: shipment });
            }
            catch (error) {
                console.error('Mark Delivered Error:', error);
                return res.status(500).json({ status: false, error: error.message });
            }
        });
    }
}
exports.ShippingController = ShippingController;
