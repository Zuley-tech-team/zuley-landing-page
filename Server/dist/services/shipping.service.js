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
exports.ShippingService = void 0;
const shipping_model_1 = require("../models/shipping.model");
const order_model_1 = require("../models/order.model");
const payment_model_1 = require("../models/payment.model");
const email_service_1 = require("./email.service");
const email_queue_model_1 = require("../models/email-queue.model");
class ShippingService {
    /**
     * Helper to generate tracking URL based on courier
     */
    static generateTrackingUrl(courierName, trackingNumber) {
        const normalizedCourier = courierName.toLowerCase().trim();
        if (normalizedCourier.includes('blue dart') || normalizedCourier.includes('bluedart')) {
            return `https://www.bluedart.com/tracking/${trackingNumber}`;
        }
        else if (normalizedCourier.includes('delhivery')) {
            return `https://www.delhivery.com/track/package/${trackingNumber}`;
        }
        else if (normalizedCourier.includes('dtdc')) {
            return `https://www.dtdc.in/trace.asp?cno=${trackingNumber}`;
        }
        else if (normalizedCourier.includes('india post') || normalizedCourier.includes('speed post')) {
            return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consession=${trackingNumber}`;
        }
        else if (normalizedCourier.includes('shiprocket')) {
            return `https://www.shiprocket.in/shipment-tracking/${trackingNumber}`;
        }
        return ''; // Return empty if unknown, or maybe a google search link?
    }
    /**
     * Mark an order as shipped and create a shipment record
     */
    static createShipment(orderId, courierName, trackingNumber, trackingUrl, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const order = yield order_model_1.Order.findOne({ order_id: orderId });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            if (order.status !== 'paid' && order.status !== 'created' && order.status !== 'confirmed') {
                // Allow 'created' just in case payment flow had minor sync issues, but ideally 'paid'
                // If already shipped, throw error? 
                if (order.status === 'shipped' || order.status === 'delivered') {
                    throw new Error(`Order ${orderId} is already shipped or delivered`);
                }
            }
            // Auto-generate URL if not provided
            const finalTrackingUrl = trackingUrl || this.generateTrackingUrl(courierName, trackingNumber);
            const shipmentData = {
                orderId: order._id,
                courierName,
                trackingNumber,
                trackingUrl: finalTrackingUrl,
                status: 'shipped',
                shippedAt: new Date(),
                notes,
                history: [{
                        status: 'shipped',
                        timestamp: new Date(),
                        note: 'Shipment created'
                    }]
            };
            const shipment = new shipping_model_1.Shipping(shipmentData);
            yield shipment.save();
            // Update Order Status
            order.status = 'shipped';
            order.shipping_details = {
                courier_name: courierName,
                tracking_number: trackingNumber,
                tracking_url: finalTrackingUrl,
                shipped_at: new Date()
            };
            // Add to order history
            order.history.push({
                status: 'shipped',
                changed_by: 'admin', // or system
                reason: `Shipped via ${courierName} (${trackingNumber})`,
                timestamp: new Date()
            });
            yield order.save();
            if ((_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.email) {
                yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.SHIPPING_CONFIRMATION, order.customer_details.email, order._id, {
                    orderId: order.order_id,
                    customerName: order.customer_details.name,
                    courierName,
                    trackingNumber,
                    trackingUrl: finalTrackingUrl,
                });
            }
            return shipment;
        });
    }
    /**
     * Update tracking details for an existing shipment
     */
    static updateTracking(orderId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield order_model_1.Order.findOne({ order_id: orderId });
            if (!order)
                throw new Error(`Order ${orderId} not found`);
            const shipment = yield shipping_model_1.Shipping.findOne({ orderId: order._id });
            if (!shipment)
                throw new Error(`Shipment for order ${orderId} not found`);
            if (updates.courierName)
                shipment.courierName = updates.courierName;
            if (updates.trackingNumber)
                shipment.trackingNumber = updates.trackingNumber;
            // Regenerate URL if courier/number changed and no specific URL provided
            if ((updates.courierName || updates.trackingNumber) && !updates.trackingUrl) {
                shipment.trackingUrl = this.generateTrackingUrl(shipment.courierName, shipment.trackingNumber);
            }
            else if (updates.trackingUrl) {
                shipment.trackingUrl = updates.trackingUrl;
            }
            if (updates.notes)
                shipment.notes = updates.notes;
            if (updates.status && updates.status !== shipment.status) {
                shipment.status = updates.status;
                shipment.history.push({
                    status: updates.status,
                    timestamp: new Date(),
                    note: 'Status updated manually'
                });
                // If delivered, update order too?
                // Usually use markDelivered for that, but handle here too
            }
            yield shipment.save();
            // Sync important fields to Order
            if (!order.shipping_details) {
                order.shipping_details = {};
            }
            order.shipping_details.courier_name = shipment.courierName;
            order.shipping_details.tracking_number = shipment.trackingNumber;
            order.shipping_details.tracking_url = shipment.trackingUrl;
            yield order.save();
            return shipment;
        });
    }
    /**
     * Mark shipment as delivered
     */
    static markDelivered(orderId, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const order = yield order_model_1.Order.findOne({ order_id: orderId });
            if (!order)
                throw new Error(`Order ${orderId} not found`);
            const shipment = yield shipping_model_1.Shipping.findOne({ orderId: order._id });
            if (!shipment)
                throw new Error(`Shipment for order ${orderId} not found`);
            if (shipment.status === 'delivered')
                return shipment;
            shipment.status = 'delivered';
            shipment.deliveredAt = new Date();
            if (notes)
                shipment.notes = notes;
            shipment.history.push({
                status: 'delivered',
                timestamp: new Date(),
                note: notes || 'Marked as delivered'
            });
            yield shipment.save();
            // Update Order
            order.status = 'delivered';
            if (order.payment_method === 'cod') {
                order.payment_status = 'cod_collected';
                yield payment_model_1.Payment.findByIdAndUpdate(order.payment_id, {
                    status: 'cod_collected',
                    collected_at: new Date()
                });
            }
            if (!order.shipping_details) {
                order.shipping_details = {};
            }
            order.shipping_details.delivered_at = new Date();
            order.history.push({
                status: 'delivered',
                changed_by: 'admin',
                reason: 'Shipment delivered',
                timestamp: new Date()
            });
            yield order.save();
            if ((_a = order.customer_details) === null || _a === void 0 ? void 0 : _a.email) {
                yield email_service_1.EmailService.addToQueue(email_queue_model_1.EmailType.DELIVERY_CONFIRMATION, order.customer_details.email, order._id, {
                    orderId: order.order_id,
                    customerName: order.customer_details.name,
                });
            }
            return shipment;
        });
    }
}
exports.ShippingService = ShippingService;
