import mongoose from 'mongoose';
import { ShippingService } from '../services/shipping.service';
import { Customer } from '../models/customer.model';
import { Order } from '../models/order.model';
import { Shipping } from '../models/shipping.model';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zuley';

async function verifyShipping() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create Mock Paid Order
        const mockOrder = new Order({
            order_id: `SHIP-TEST-${Date.now()}`,
            customer_details: {
                name: "Shipping Tester",
                email: "ship@test.com",
                phone: "9988776655",
                customer_id: new mongoose.Types.ObjectId()
            },
            items: [{
                sku: "TEST-SKU",
                name: "Test Item",
                quantity: 1,
                price: 500,
                total_price: 500
            }],
            total_amount: 500,
            status: 'paid', // Must be paid to ship
            payment_id: new mongoose.Types.ObjectId(),
            shipping_address: {
                line1: "123 Ship Lane",
                city: "Pune",
                state: "Maharashtra",
                pincode: "411001"
            }
        });
        await mockOrder.save();
        console.log(`Created Mock Order: ${mockOrder.order_id}`);

        // 2. Test: Create Shipment
        console.log('\n--- Test 1: Create Shipment ---');
        const shipment = await ShippingService.createShipment(
            mockOrder.order_id,
            'Blue Dart',
            '1234567890',
            undefined, // Let it auto-generate URL
            'Test Note'
        );
        console.log('Shipment Created:', shipment._id);
        console.log('Tracking URL:', shipment.trackingUrl);

        // Verify Order Status
        const updatedOrder = await Order.findById(mockOrder._id);
        if (updatedOrder?.status === 'shipped') {
            console.log('SUCCESS: Order status updated to shipped');
        } else {
            console.error('FAILURE: Order status not updated. Current:', updatedOrder?.status);
        }

        // 3. Test: Update Tracking
        console.log('\n--- Test 2: Update Tracking ---');
        const updatedShipment = await ShippingService.updateTracking(mockOrder.order_id, {
            courierName: 'Delhivery',
            trackingNumber: '9876543210'
        });
        console.log('Updated Courier:', updatedShipment.courierName);
        console.log('Updated URL:', updatedShipment.trackingUrl);

        if (updatedShipment.trackingUrl.includes('delhivery')) {
            console.log('SUCCESS: Tracking URL regenerated correctly');
        } else {
            console.error('FAILURE: Tracking URL incorrect');
        }

        // 4. Test: Mark Delivered
        console.log('\n--- Test 3: Mark Delivered ---');
        await ShippingService.markDelivered(mockOrder.order_id, 'Left at front door');

        const finalOrder = await Order.findById(mockOrder._id);
        if (finalOrder?.status === 'delivered') {
            console.log('SUCCESS: Order status updated to delivered');
        } else {
            console.error('FAILURE: Order status not delivered');
        }

        // Cleanup
        // await Order.deleteOne({ _id: mockOrder._id });
        // await Shipping.deleteOne({ _id: shipment._id });

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyShipping();
