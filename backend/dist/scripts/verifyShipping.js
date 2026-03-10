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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const shipping_service_1 = require("../services/shipping.service");
const order_model_1 = require("../models/order.model");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zuley';
function verifyShipping() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(MONGODB_URI);
            console.log('Connected to MongoDB');
            // 1. Create Mock Paid Order
            const mockOrder = new order_model_1.Order({
                order_id: `SHIP-TEST-${Date.now()}`,
                customer_details: {
                    name: "Shipping Tester",
                    email: "ship@test.com",
                    phone: "9988776655",
                    customer_id: new mongoose_1.default.Types.ObjectId()
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
                payment_id: new mongoose_1.default.Types.ObjectId(),
                shipping_address: {
                    line1: "123 Ship Lane",
                    city: "Pune",
                    state: "Maharashtra",
                    pincode: "411001"
                }
            });
            yield mockOrder.save();
            console.log(`Created Mock Order: ${mockOrder.order_id}`);
            // 2. Test: Create Shipment
            console.log('\n--- Test 1: Create Shipment ---');
            const shipment = yield shipping_service_1.ShippingService.createShipment(mockOrder.order_id, 'Blue Dart', '1234567890', undefined, // Let it auto-generate URL
            'Test Note');
            console.log('Shipment Created:', shipment._id);
            console.log('Tracking URL:', shipment.trackingUrl);
            // Verify Order Status
            const updatedOrder = yield order_model_1.Order.findById(mockOrder._id);
            if ((updatedOrder === null || updatedOrder === void 0 ? void 0 : updatedOrder.status) === 'shipped') {
                console.log('SUCCESS: Order status updated to shipped');
            }
            else {
                console.error('FAILURE: Order status not updated. Current:', updatedOrder === null || updatedOrder === void 0 ? void 0 : updatedOrder.status);
            }
            // 3. Test: Update Tracking
            console.log('\n--- Test 2: Update Tracking ---');
            const updatedShipment = yield shipping_service_1.ShippingService.updateTracking(mockOrder.order_id, {
                courierName: 'Delhivery',
                trackingNumber: '9876543210'
            });
            console.log('Updated Courier:', updatedShipment.courierName);
            console.log('Updated URL:', updatedShipment.trackingUrl);
            if (updatedShipment.trackingUrl.includes('delhivery')) {
                console.log('SUCCESS: Tracking URL regenerated correctly');
            }
            else {
                console.error('FAILURE: Tracking URL incorrect');
            }
            // 4. Test: Mark Delivered
            console.log('\n--- Test 3: Mark Delivered ---');
            yield shipping_service_1.ShippingService.markDelivered(mockOrder.order_id, 'Left at front door');
            const finalOrder = yield order_model_1.Order.findById(mockOrder._id);
            if ((finalOrder === null || finalOrder === void 0 ? void 0 : finalOrder.status) === 'delivered') {
                console.log('SUCCESS: Order status updated to delivered');
            }
            else {
                console.error('FAILURE: Order status not delivered');
            }
            // Cleanup
            // await Order.deleteOne({ _id: mockOrder._id });
            // await Shipping.deleteOne({ _id: shipment._id });
        }
        catch (error) {
            console.error('Verification failed:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
verifyShipping();
