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
const invoice_service_1 = require("../services/invoice.service");
const customer_model_1 = require("../models/customer.model");
const order_model_1 = require("../models/order.model");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zuley';
function verifyInvoicing() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(MONGODB_URI);
            console.log('Connected to MongoDB');
            // 1. Reset Counter for clean test (Optional, but good for sequential check)
            // await Counter.deleteOne({ _id: 'invoice_2025' }); 
            // Commented out to test persistence
            // 2. Create Mock Order and Customer
            const mockCustomer = new customer_model_1.Customer({
                full_name: "Test Customer",
                email: "test@example.com",
                phone: "9876543210",
                address_line1: "123 Test St",
                city: "Mumbai",
                state: "Maharashtra", // Intra-state (27)
                pincode: "400001"
            });
            // Don't save if not needed, but InvoiceService might expect saved docs with _id
            // Actually InvoiceService expects objects with _id.
            // Let's not save to DB to avoid pollution, just mock _id
            mockCustomer._id = new mongoose_1.default.Types.ObjectId();
            const mockOrder = new order_model_1.Order({
                order_id: "TEST-ORDER-001",
                customer_details: {
                    name: mockCustomer.full_name,
                    email: mockCustomer.email,
                    phone: mockCustomer.phone,
                    customer_id: mockCustomer._id
                },
                items: [
                    {
                        sku: "SLV-RING-001",
                        name: "Silver Ring",
                        quantity: 1,
                        price: 1000,
                        total_price: 1000
                    },
                    {
                        sku: "SLV-COIN-001",
                        name: "Silver Coin",
                        quantity: 2,
                        price: 500,
                        total_price: 1000
                    }
                ],
                total_amount: 2000,
                payment_id: new mongoose_1.default.Types.ObjectId(),
                shipping_address: {
                    line1: "123 Test St",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001"
                }
            });
            mockOrder._id = new mongoose_1.default.Types.ObjectId();
            console.log('\n--- Scenario 1: Intra-state Invoice (MH to MH) ---');
            const invoice1 = yield invoice_service_1.InvoiceService.createInvoice(mockOrder, mockCustomer);
            console.log('Invoice Generated:', invoice1.invoiceNumber);
            console.log('PDF Path:', invoice1.pdfPath);
            console.log('Tax Summary:', invoice1.taxSummary);
            if (invoice1.taxSummary.totalIGST === 0 && invoice1.taxSummary.totalCGST > 0) {
                console.log('SUCCESS: Intra-state tax split verified.');
            }
            else {
                console.error('FAILURE: Intra-state tax calculation incorrect.');
            }
            console.log('\n--- Scenario 2: Inter-state Invoice (MH to Delhi) ---');
            const delhiCustomer = new customer_model_1.Customer({
                full_name: "Delhi Customer",
                email: "delhi@example.com",
                phone: "9876543211",
                address_line1: "456 Connaught Place",
                city: "New Delhi",
                state: "Delhi", // Inter-state (07)
                pincode: "110001"
            });
            delhiCustomer._id = new mongoose_1.default.Types.ObjectId();
            const delhiOrder = new order_model_1.Order({
                order_id: "TEST-ORDER-002",
                customer_details: {
                    name: delhiCustomer.full_name,
                    email: delhiCustomer.email,
                    phone: delhiCustomer.phone,
                    customer_id: delhiCustomer._id
                },
                items: [
                    {
                        sku: "SLV-BAR-001",
                        name: "Silver Bar",
                        quantity: 1,
                        price: 10000,
                        total_price: 10000
                    }
                ],
                total_amount: 10000,
                payment_id: new mongoose_1.default.Types.ObjectId(),
                shipping_address: {
                    line1: "456 Connaught Place",
                    city: "New Delhi",
                    state: "Delhi",
                    pincode: "110001"
                }
            });
            delhiOrder._id = new mongoose_1.default.Types.ObjectId();
            const invoice2 = yield invoice_service_1.InvoiceService.createInvoice(delhiOrder, delhiCustomer);
            console.log('Invoice Generated:', invoice2.invoiceNumber);
            console.log('PDF Path:', invoice2.pdfPath);
            console.log('Tax Summary:', invoice2.taxSummary);
            if (invoice2.taxSummary.totalIGST > 0 && invoice2.taxSummary.totalCGST === 0) {
                console.log('SUCCESS: Inter-state tax verified.');
            }
            else {
                console.error('FAILURE: Inter-state tax calculation incorrect.');
            }
            // Cleanup
            // await Invoice.deleteMany({ _id: { $in: [invoice1._id, invoice2._id] } });
        }
        catch (error) {
            console.error('Verification failed:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
verifyInvoicing();
