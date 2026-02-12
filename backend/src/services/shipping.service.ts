import { Shipping, IShipping } from '../models/shipping.model';
import { Order } from '../models/order.model';
import { EmailService } from './email.service';
import mongoose from 'mongoose';

export class ShippingService {

    /**
     * Helper to generate tracking URL based on courier
     */
    private static generateTrackingUrl(courierName: string, trackingNumber: string): string {
        const normalizedCourier = courierName.toLowerCase().trim();

        if (normalizedCourier.includes('blue dart') || normalizedCourier.includes('bluedart')) {
            return `https://www.bluedart.com/tracking/${trackingNumber}`;
        } else if (normalizedCourier.includes('delhivery')) {
            return `https://www.delhivery.com/track/package/${trackingNumber}`;
        } else if (normalizedCourier.includes('dtdc')) {
            return `https://www.dtdc.in/trace.asp?cno=${trackingNumber}`;
        } else if (normalizedCourier.includes('india post') || normalizedCourier.includes('speed post')) {
            return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consession=${trackingNumber}`;
        } else if (normalizedCourier.includes('shiprocket')) {
            return `https://www.shiprocket.in/shipment-tracking/${trackingNumber}`;
        }

        return ''; // Return empty if unknown, or maybe a google search link?
    }

    /**
     * Mark an order as shipped and create a shipment record
     */
    public static async createShipment(
        orderId: string,
        courierName: string,
        trackingNumber: string,
        trackingUrl?: string,
        notes?: string
    ): Promise<IShipping> {

        const order = await Order.findOne({ order_id: orderId });
        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }

        if (order.status !== 'paid' && order.status !== 'created') {
            // Allow 'created' just in case payment flow had minor sync issues, but ideally 'paid'
            // If already shipped, throw error? 
            if (order.status === 'shipped' || order.status === 'delivered') {
                throw new Error(`Order ${orderId} is already shipped or delivered`);
            }
        }

        // Auto-generate URL if not provided
        const finalTrackingUrl = trackingUrl || this.generateTrackingUrl(courierName, trackingNumber);

        const shipmentData: Partial<IShipping> = {
            orderId: order._id as any,
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

        const shipment = new Shipping(shipmentData);
        await shipment.save();

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

        await order.save();

        // Send Email Notification
        // Since EmailService might not have this method yet, we suppress error or assuming it exists
        try {
            // We need to fetch customer email. It's in order.customer_details.email
            if (order.customer_details?.email) {
                await EmailService.addToQueue(
                    "shipping_confirmation" as any,
                    order.customer_details.email,
                    order._id,
                    {
                        orderId: orderId,
                        customerName: order.customer_details.name,
                        courierName: courierName,
                        trackingNumber: trackingNumber,
                        trackingUrl: finalTrackingUrl
                    }
                );
            }
        } catch (emailErr) {
            console.error(`Failed to send shipping email for ${orderId}`, emailErr);
        }

        return shipment;
    }

    /**
     * Update tracking details for an existing shipment
     */
    public static async updateTracking(
        orderId: string,
        updates: { courierName?: string, trackingNumber?: string, trackingUrl?: string, status?: string, notes?: string }
    ): Promise<IShipping> {
        const order = await Order.findOne({ order_id: orderId });
        if (!order) throw new Error(`Order ${orderId} not found`);

        const shipment = await Shipping.findOne({ orderId: order._id });
        if (!shipment) throw new Error(`Shipment for order ${orderId} not found`);

        if (updates.courierName) shipment.courierName = updates.courierName;
        if (updates.trackingNumber) shipment.trackingNumber = updates.trackingNumber;

        // Regenerate URL if courier/number changed and no specific URL provided
        if ((updates.courierName || updates.trackingNumber) && !updates.trackingUrl) {
            shipment.trackingUrl = this.generateTrackingUrl(shipment.courierName, shipment.trackingNumber);
        } else if (updates.trackingUrl) {
            shipment.trackingUrl = updates.trackingUrl;
        }

        if (updates.notes) shipment.notes = updates.notes;

        if (updates.status && updates.status !== shipment.status) {
            shipment.status = updates.status as any;
            shipment.history.push({
                status: updates.status,
                timestamp: new Date(),
                note: 'Status updated manually'
            });

            // If delivered, update order too?
            // Usually use markDelivered for that, but handle here too
        }

        await shipment.save();

        // Sync important fields to Order
        if (!order.shipping_details) {
            order.shipping_details = {};
        }
        order.shipping_details.courier_name = shipment.courierName;
        order.shipping_details.tracking_number = shipment.trackingNumber;
        order.shipping_details.tracking_url = shipment.trackingUrl;
        await order.save();

        return shipment;
    }

    /**
     * Mark shipment as delivered
     */
    public static async markDelivered(orderId: string, notes?: string): Promise<IShipping> {
        const order = await Order.findOne({ order_id: orderId });
        if (!order) throw new Error(`Order ${orderId} not found`);

        const shipment = await Shipping.findOne({ orderId: order._id });
        if (!shipment) throw new Error(`Shipment for order ${orderId} not found`);

        if (shipment.status === 'delivered') return shipment;

        shipment.status = 'delivered';
        shipment.deliveredAt = new Date();
        if (notes) shipment.notes = notes;

        shipment.history.push({
            status: 'delivered',
            timestamp: new Date(),
            note: notes || 'Marked as delivered'
        });

        await shipment.save();

        // Update Order
        order.status = 'delivered';
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
        await order.save();

        // Send Delivery Email
        try {
            if (order.customer_details?.email) {
                await EmailService.addToQueue(
                    "delivery_confirmation" as any,
                    order.customer_details.email, // Use order's customer email
                    order._id,
                    {
                        orderId: orderId,
                        customerName: order.customer_details.name,
                    }
                );
            }
        } catch (emailErr) {
            console.error(`Failed to send delivery email for ${orderId}`, emailErr);
        }

        return shipment;
    }
}
