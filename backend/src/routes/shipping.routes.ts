import express from 'express';
import { ShippingController } from '../controllers/shipping.controller';
import { authenticateAdmin } from '../middlewares/admin.middleware';

const router = express.Router();

router.use(authenticateAdmin);

router.post('/ship', ShippingController.shipOrder);
router.post('/update', ShippingController.updateTracking);
router.post('/deliver', ShippingController.markDelivered);

export default router;
