import { Request, Response } from 'express';
import { ShippingService } from '../services/shipping.service';
import mongoose from 'mongoose';

export class ShippingController {

    /**
     * Mark an order as shipped (create shipment)
     * POST /api/v1/shipping/ship
     * Body: { orderId, courierName, trackingNumber, trackingUrl, notes }
     */
    public static async shipOrder(req: Request, res: Response) {
        try {
            const { orderId, courierName, trackingNumber, trackingUrl, notes } = req.body;

            if (!orderId || !courierName || !trackingNumber) {
                return res.status(400).json({ status: false, error: 'Missing required fields' });
            }

            const shipment = await ShippingService.createShipment(
                orderId,
                courierName,
                trackingNumber,
                trackingUrl,
                notes
            );

            return res.status(200).json({ status: true, data: shipment });
        } catch (error: any) {
            console.error('Ship Order Error:', error);
            return res.status(500).json({ status: false, error: error.message || 'Internal Server Error' });
        }
    }

    /**
     * Update tracking details
     * POST /api/v1/shipping/update
     * Body: { orderId, courierName, trackingNumber, trackingUrl, status, notes }
     */
    public static async updateTracking(req: Request, res: Response) {
        try {
            const { orderId, ...updates } = req.body;

            if (!orderId) {
                return res.status(400).json({ status: false, error: 'Order ID required' });
            }

            const shipment = await ShippingService.updateTracking(orderId, updates);

            return res.status(200).json({ status: true, data: shipment });
        } catch (error: any) {
            console.error('Update Tracking Error:', error);
            return res.status(500).json({ status: false, error: error.message });
        }
    }

    /**
     * Mark shipment as delivered
     * POST /api/v1/shipping/deliver
     * Body: { orderId, notes }
     */
    public static async markDelivered(req: Request, res: Response) {
        try {
            const { orderId, notes } = req.body;

            if (!orderId) {
                return res.status(400).json({ status: false, error: 'Order ID required' });
            }

            const shipment = await ShippingService.markDelivered(orderId, notes);

            return res.status(200).json({ status: true, data: shipment });
        } catch (error: any) {
            console.error('Mark Delivered Error:', error);
            return res.status(500).json({ status: false, error: error.message });
        }
    }
}
