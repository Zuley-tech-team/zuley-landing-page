import express from 'express';
import { ShippingController } from '../controllers/shipping.controller';

const router = express.Router();

// Middleware to check admin auth should be added here in real app
// router.use(requireAdmin);

router.post('/ship', ShippingController.shipOrder);
router.post('/update', ShippingController.updateTracking);
router.post('/deliver', ShippingController.markDelivered);

export default router;
